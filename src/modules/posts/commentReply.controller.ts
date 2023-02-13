// @ts-nocheck
import { NextFunction } from 'express';
import Comment from './comments.model';
import catchAsync from '../utils/catchAsync';
import Post from './post.model';
import ApiError from '../errors/ApiError';
import Notification from './notifications.model';
import CommentReply from './commentReply.model';
//const getProfileId = require("../utils/profile");

//check post is in db
export const checkComment = async (req, res, next: NextFunction) => {
  const comment = await Comment.findById(req.body.comment_id);

  if (!comment) {
    return next(new ApiError(400, 'Comment not available'));
  }

  req.comment = comment;
  next();
};

//comment to a post

export const addCommentReply = catchAsync(async (req, res, next) => {
  const comment = req.comment;

  const commentReply = await CommentReply.create({
    user: req.user.id,
    comment: comment.id,
    ...req.body,
  });

  comment.replies.push(commentReply.id);
  await comment.save();

  if (req.user.id.toString() !== comment.user.toString()) {
    await Notification.create({
      user: req.user.id,
      to: new Array(comment.user),
      type: 'Comment',
      message: `${req.user?.username} replied to your comment `,
      seen: new Array(req.user.id),
      comment: comment.id,
    });
  }

  res.status(200).json({
    status: 'success',
    commentReply,
  });
});

export const getCommentReplies = catchAsync(async (req, res, next) => {
  const replies = await CommentReply.find({ comment: req.params.id }).populate({
    path: 'user',
    select: 'id _id username profile_pic firstname lastname',
  });

  res.status(200).json({
    status: 'success',
    length: replies.length,
    replies,
  });
});

//like comment
export const likeCommentReply = catchAsync(async (req, res, next) => {
  const id = req.user.id;

  const reply = await CommentReply.findById(req.params.id);

  if (!reply) {
    return next(new ApiError(400, 'reply not found'));
  }

  const checkLike = reply.likes.findIndex((like) => like._id.toString() === id.toString());

  if (checkLike >= 0) {
    reply.likes.splice(checkLike, 1);
    await reply.save();
    await Notification.deleteMany({
      to: reply.user,
      user: id,
      type: 'Like',
      comment: reply.id,
    });
  } else {
    reply.likes.unshift(id);
    await reply.save();
    if (id.toString() !== reply.user?.toString()) {
      await Notification.create({
        user: id,
        to: new Array(reply.user),
        type: 'Like',
        message: `${req.user?.username} liked your reply`,
        seen: new Array(id),
        comment: reply.id,
      });
    }
  }

  res.status(200).json({
    status: 'success',
  });
});

//delete comment

export const deleteCommentReply = catchAsync(async (req, res, next) => {
  const comment = await CommentReply.findById(req.params.id);
  return comment.user.toString() === req.user.id.toString()
    ? (await comment.remove(),
      res.json({
        status: 'success',
      }))
    : next(new ApiError(401, 'You are not authorized to delete this comment'));
});

// @ts-nocheck
import { NextFunction } from 'express';
import Comment from './comments.model';
import catchAsync from '../utils/catchAsync';
import Post from './post.model';
import ApiError from '../errors/ApiError';
//const getProfileId = require("../utils/profile");

//check post is in db
export const checkPost = async (req, res, next: NextFunction) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new ApiError(400, 'Post not available'));
  }
  next();
};

//comment to a post

export const addComment = catchAsync(async (req, res, next) => {
  const comment = await Comment.create({
    user: req.user.id,
    post: req.params.id,
    ...req.body,
  });

  res.status(200).json({
    status: 'success',
    comment,
  });
});

export const getPostComments = catchAsync(async (req, res, next) => {
  const comments = await Comment.find({ post: req.params.id });

  res.status(200).json({
    status: 'success',
    length: comments.length,
    comments,
  });
});

//like comment
export const likeComment = catchAsync(async (req, res, next) => {
  const id = req.user.id;

  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    return next(new ApiError(400, 'Comment not found'));
  }

  const checkLike = comment.likes.findIndex((like) => like._id.toString() === id.toString());

  if (checkLike >= 0) {
    comment.likes.splice(checkLike, 1);
    await comment.save();
  } else {
    comment.likes.unshift(id);
    await comment.save();
  }

  res.status(200).json({
    status: 'success',
  });
});

//delete comment

export const deleteComment = catchAsync(async (req, res, next) => {
  const comment = await Comment.findById(req.params.commentId);
  return comment.user.toString() === req.user.id.toString()
    ? (await comment.remove(),
      res.json({
        status: 'success',
      }))
    : next(new ApiError(401, 'You are not authorized to delete this comment'));
});

// @ts-nocheck
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import Post from './post.model';
import Notification from './notifications.model';
import mongoose from 'mongoose';
import catchAsync from '../utils/catchAsync';
import ApiError from '../errors/ApiError';
import pick from '../utils/pick';
import { IOptions } from '../paginate/paginate';
import { fileUpload } from '../utils/fileUpload';

const deleteImageCloudinary = async (id) => {
  const { post_files } = await Post.findById(id);
  await post_files.map((img) => cloudinary.uploader.destroy(img.cloudinary_id));
};

const getPagination = async (page = 1, size = 10) => {
  const limit = size;
  const offset = parseInt(page) * limit;

  return { limit, offset };
};

export const createPost = catchAsync(async (req: Request, res: Response) => {
  const files = req.files;

  let uploads = [];

  if (files) {
    try {
      for (const file of files) {
        const newPath = await fileUpload(file);

        uploads.push({
          cloudinary_id: newPath.public_id,
          url: newPath.secure_url,
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  const post = await Post.create({
    user: req.user.id,
    post_files: uploads,
    posted_at: new Date(),
    ...req.body,
  });

  res.status(201).json({
    status: 'success',
    post,
  });
});

export const getUserNotifications = catchAsync(async (req: Request, res: Response) => {
  const { page, size, title } = req.query;

  const { limit, offset } = await getPagination(page, size);

  const options = {
    page: page || 1,
    limit: size || 5,
    populate: 'user',
    sort: { createdAt: -1 },
  };

  await Notification.paginate({ to: mongoose.Types.ObjectId(req?.user?.id.toString()) }, options, function (err, result) {
    res.send({
      totalItems: result.totalDocs,
      notifications: result.docs,
      totalPages: result.totalPages,
      currentPage: result.page - 1,
    });
  });
});

export const getAllPost = catchAsync(async (req, res, next) => {
  const { page, size, title } = req.query;

  const options = {
    page: page || 1,
    limit: size || 20,
    collation: {
      locale: 'en',
    },
    populate: 'user',
    sort: { posted_at: -1 },
  };

  const fol_obj = req.user.following;

  // const following = Array.from(fol_obj, ([key, value]) => new mongoose.Types.ObjectId(value.user));

  fol_obj.push(new mongoose.Types.ObjectId(req.user.id));

  Post.paginate({ user: { $in: fol_obj } }, options, function (err, result) {
    res.send({
      totalItems: result.totalDocs,
      posts: result.docs,
      totalPages: result.totalPages,
      currentPage: result.page,
    });
  });
});

export const getUserPost = async (id: string) => {
  const posts = await Post.find({ user: id }).sort({ posted_at: -1 });

  return posts;
};

export const getUserPostComment = catchAsync(async (req, res) => {
  const posts = await Post.find({
    $or: [{ user: req.user.id }, { comments: mongoose.Types.ObjectId(req?.user?.id.toString()) }],
  }).sort({ posted_at: -1 }).populate('user');

  res.status(201).json(posts);
});

export const getPostById = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id).populate('user');

  if (!post) {
    return next(new ApiError(400, 'Post not found'));
  }

  res.status(200).json({
    status: 'success',
    post,
  });
});

export const repost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new ApiError(400, 'Post not found'));
  }

  if (post.user == req.user.id) {
    return next(new ApiError(400, "Can't re-upload your posts"));
  }

  const reposted = post.reposts.findIndex((e) => e.user == req.user.id.toString());

  if (reposted >= 0) {
    const newPost = await Post.findById(post.reposts[reposted].repostId);

    await newPost.remove();

    post.reposts.splice(reposted, 1);
    await post.save((err) => {
      err && console.log(err);
    });

    res.status(200).json({
      status: 'success',
      message: 'Re-up removed',
    });
  } else {
    const newPost = await Post.create({
      caption: post.caption,
      post_files: post.post_files,
      user: req.user.id,
      posted_at: new Date(),
    });

    post.reposts.push({ user: req.user.id, repostId: newPost.id });
    await post.save();

    res.status(200).json({
      status: 'success',
      message: 'Post re-upped to followers',
    });
  }
});

export const deletePost = catchAsync(async (req, res, next) => {
  //const post = await Post.deleteOne({ _id: req.params.id });
  const post = await Post.findById(req.params.id);
  if (!post) {
    return next(new ApiError(400, 'Post not found'));
  }
  //  console.log(post, post.user.toString() === req.user.id)
  if (post.user.toString() !== req.user.id) {
    return next(new ApiError(401, 'You are not authorized to delete this post'));
  }

  // post.comments?.length &&
  //   (await Comment.findByIdAndDelete(post.commentsPost[0]._id));

  // await deleteImageCloudinary(req.params.id);
  await post.remove();

  res.status(200).json({
    message: 'deleted',
  });
});

export const likePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id).populate('user');

  if (!post) {
    return next(new ApiError(400, 'Post not found'));
  }
  const id = req.user.id;

  if (post.likes.includes(id.toString())) {
    const index = post.likes.indexOf(id);
    post.likes.splice(index, 1);
    await post.save((err) => {
      console.log(err);
    });
    await Notification.deleteMany({
      to: post.user.id,
      user: id,
      type: 'Like',
      post: post.id,
    });
  } else {
    post.likes.push(id);
    await post.save();

    if (id !== post.user.id) {
      await Notification.create({
        user: id,
        to: new Array(post.user.id),
        type: 'Like',
        message: `${req.user?.username} liked your post`,
        seen: new Array(id),
        post: post.id,
      });
    }
  }

  res.status(200).json({
    status: 'success',
    post,
  });
});

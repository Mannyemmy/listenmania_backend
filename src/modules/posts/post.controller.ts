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

const getPagination = (page, size) => {
  const limit = size ? +size : 10;
  const offset = page ? page * limit : 0;

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

export const getAllPost = catchAsync(async (req, res, next) => {
  const { page, size, title } = req.query;

  const { limit, offset } = getPagination(page, size);

  const options = {
    page: 1,
    limit: 10,
    collation: {
      locale: 'en',
    },
    populate: 'user',
    sort: { posted_at: -1 },
  };

  Post.paginate({}, options, function (err, result) {
    res.send({
      totalItems: result.totalDocs,
      posts: result.docs,
      totalPages: result.totalPages,
      currentPage: result.page - 1,
    });
  });
});

export const getUserPost = async (id: string) => {
  const posts = await Post.find({ user: id }).sort({ posted_at: -1 });

  return posts;
};

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
    });
  } else {
    post.likes.push(id);
    await post.save();
  }

  res.status(200).json({
    status: 'success',
    post,
  });
});

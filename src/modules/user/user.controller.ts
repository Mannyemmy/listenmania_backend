// @ts-nocheck
import { getUserPost } from './../posts/post.controller';
import httpStatus from 'http-status';
import { fileUpload } from '../utils/fileUpload';

import { Request, Response } from 'express';
import mongoose from 'mongoose';
import catchAsync from '../utils/catchAsync';
import ApiError from '../errors/ApiError';
import pick from '../utils/pick';
import { IOptions } from '../paginate/paginate';
import * as userService from './user.service';
import User from './user.model';
import Song from '../songs/models/song.model';
import Playlist from '../songs/models/playlist.model';
import Notification from '../posts/notifications.model';

export const createUser = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

export const valUsername = catchAsync(async (req: Request, res: Response) => {
  let result;
  if (req.body.id) {
    result = await userService.validateUsername(req.body.username, new mongoose.Types.ObjectId(req.body.id));
  } else {
    result = await userService.validateUsername(req.body.username);
  }
  res.send(result);
});

export const valEmail = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.validateEmail(req.body.email);
  res.send(result);
});

export const getUsers = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, ['name', 'role']);
  const options: IOptions = pick(req.query, ['sortBy', 'limit', 'page', 'projectBy']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

export const getUser = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['userId'] === 'string') {
    const user = await userService.getUserById(new mongoose.Types.ObjectId(req.params['userId']));
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    const posts = await getUserPost(user.id);
    res.json({ user, posts });
  }
});

export const getUserProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const posts = await getUserPost(user.id);
  res.json({ user, posts });
});

export const getOtherUserProfile = catchAsync(async (req: Request, res: Response) => {
  const user = await User.findOne({ username: req.params['username'] });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  const posts = await getUserPost(user.id);
  const songs = await Song.find(
    { user: user.id },
    'fileUrl coverArt artist name user featured likes id trackLength duration'
  ).sort({ createdAt: -1 });
  const playlists = await Playlist.find({ user: user.id }, 'id coverArt name user').sort({ createdAt: -1 });
  res.status(200).json({ user, songs, playlists, posts });
});

export const getDiscoverUsers = catchAsync(async (req: Request, res: Response) => {
  let fol_obj = [];

  if (req.user.following) {
    fol_obj = req.user.following;
  }

  // const following = Array.from(fol_obj, ([key, value]) => new mongoose.Types.ObjectId(value.user));

  fol_obj.push( new mongoose.Types.ObjectId(req.user.id));

  const users = await User.aggregate([
    {
      $match: {
        _id: { $nin: fol_obj },

        role: 'user',
      },
    },
    { $sample: { size: 10 } },
  ]);

  if (users) {
    res.status(200).json(users);
  }
});

export const updateUser = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['userId'] === 'string') {
    const user = await userService.updateUserById(new mongoose.Types.ObjectId(req.params['userId']), req.body);
    res.send(user);
  }
});

export const updateUserNew = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;

  if (req.body.username && (await User.isUsernameTaken(req.body.username, user.id))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Username already taken');
  }

  Object.assign(user, req.body);

  const pic = req.file;

  if (pic) {
    try {
      const newPath = await fileUpload(pic);

      user.profile_pic = newPath.secure_url;
    } catch (error) {
      console.log(error);
    }
  }

  await user.save();

  res.send(user);
});

export const deleteUser = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['userId'] === 'string') {
    await userService.deleteUserById(new mongoose.Types.ObjectId(req.params['userId']));
    res.status(httpStatus.NO_CONTENT).send();
  }
});

export const followUser = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['id'] === 'string') {
    const user = await userService.getUserById(req.params['id']);
    if (req.user?.id === req?.params['id'].toString()) throw new ApiError(httpStatus.NOT_FOUND, "You can't follow yourself");
    if (user && !user?.followers) {
      user.followers = new Array();
    }
    if (user?.followers.includes(req.user.id)) {
      return res.status(200).json({
        status: 'success',
        message: 'You already follow this user',
        user,
      });
    }

    await user?.followers.push(new mongoose.Types.ObjectId(req.user.id));

    await user?.save();

    if (!req.user?.following) {
      req.user.following = new Array();
    }

    await req.user?.following.push(new mongoose.Types.ObjectId(user?.id));
    await req.user?.save();

    await Notification.create({
      user: req?.user.id,
      to: new Array(user?.id),
      type: 'Follow',
      message: `${req.user?.username} followed you`,
      seen: new Array(req.user?.id),
    });

    res.status(200).json({
      status: 'success',
      otherUserFollowers: user?.followers,
    });
  }

  return res.status(400);
});

export const unFollowUser = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['id'] === 'string') {
    if (req.user?.id === req?.params['id'].toString())
      throw new ApiError(httpStatus.NOT_FOUND, "You can't unfollow yourself");

    const user = await userService.getUserById(req.params['id']);

    if (user && !user?.followers) {
      user.followers = new Array();
    }

    if (!user?.followers.includes(req?.user.id)) {
      return res.status(200).json({
        status: 'success',
        message: "You don't follow this user",
        user,
      });
    }
    const index = user?.followers?.indexOf(req.user.id);
    user?.followers?.splice(index, 1);
    // await user?.followers.delete(req.user.id);
    await user?.save();

    if (req.user && !req.user?.following) {
      req.user?.following = new Array();
    }

    const index2 = req.user?.following.indexOf(user.id);

    req.user?.following.splice(index2, 1);
    await req.user?.save();

    await Notification.deleteMany({
      to: user?.id,
      user: req?.user?.id,
      type: 'Follow',
    });

    return res.status(200).json({
      status: 'success',
      otherUserFollowers: req.user?.following,
    });
  }
  return res.status(httpStatus.NO_CONTENT).send();
});

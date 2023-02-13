// @ts-nocheck
import httpStatus from 'http-status';

import { NextFunction, Request, Response } from 'express';
import ApiError from '../../errors/ApiError';
import catchAsync from '../../utils/catchAsync';
import Artist from '../models/artist.model';
import mongoose from 'mongoose';

export const followArtist = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const artist = await Artist.findById(req.params['id']);

  if (!artist) {
    return next(new ApiError(400, 'Artist not found'));
  }

  if (artist.followers.includes(req.user.id)) {
    const index = artist.followers?.indexOf(req.user.id);
    artist.followers?.splice(index, 1);
    await artist.save((err) => {
      err && console.log(err);
    });

    res.status(200).json({
      status: 'success',
      message: 'unfollowed',
      // artist,
    });
  } else {
    artist.followers?.push(req.user.id);
    await artist?.save((err) => {
      err && console.log(err);
    });

    res.status(200).json({
      status: 'success',
      message: 'followed',
    });
  }
});

export const likeArtist = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const artist = await Artist.findById(req.params['id']);

  if (!artist) {
    return next(new ApiError(400, 'Artist not found'));
  }

  if (artist.likes.includes(req.user.id)) {
    const index = artist.likes?.indexOf(req.user.id);
    artist.likes?.splice(index, 1);
    await artist.save((err) => {
      err && console.log(err);
    });

    res.status(200).json({
      status: 'success',
      message: 'unliked',
      // artist,
    });
  } else {
    artist.likes?.push(req.user.id);
    await artist?.save((err) => {
      err && console.log(err);
    });

    res.status(200).json({
      status: 'success',
      message: 'liked',
    });
  }
});

export const getRecentArtists = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const limit = parseInt(req?.query['size']) || 10;
  const artists = await Artist.aggregate([{ $sample: { size: limit } }]);

  if (artists) {
    res.status(200).json(artists);
  }
});

export const getLikedArtists = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const artists = await Artist.find({ likes: new mongoose.Types.ObjectId(req.user.id) });

  if (artists) {
    res.status(200).json(artists);
  }
});

export const getFollowedArtists = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const artists = await Artist.find({ followers: new mongoose.Types.ObjectId(req.user.id) });

  if (artists) {
    res.status(200).json(artists);
  }
});

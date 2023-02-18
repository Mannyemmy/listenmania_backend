// @ts-nocheck
import httpStatus from 'http-status';
import { fileUpload } from './../../utils/fileUpload';
import * as fs from 'fs';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import ApiError from '../../errors/ApiError';
import catchAsync from '../../utils/catchAsync';
import Genre from '../models/genre.model';
import Country from '../models/country.model';
import Song from '../models/song.model';
import slugify from '@sindresorhus/slugify';
import LikedSong from '../models/liked_songs.model';
import { array } from 'joi';
import Playlist from '../models/playlist.model';
import User from '../../user/user.model';
import Notification from '../../posts/notifications.model';

const getPagination = (page, size) => {
  const limit = size ? +parseInt(size) : 10;
  const offset = page ? parseInt(page) * parseInt(limit) : 0;

  return { limit, offset };
};

export const uploadSong = catchAsync(async (req: Request, res: Response) => {
  const audio = req?.files?.audio ? req?.files?.audio[0] : null;
  const cover = req?.files?.cover ? req?.files?.cover[0] : null;

  let fileUrl;
  let fileId;
  let coverArt;
  let coverArtId;

  if (audio) {
    try {
      const audioPath = await fileUpload(audio);

      fileId = audioPath.public_id;
      fileUrl = audioPath.secure_url;
    } catch (error) {
      console.log(error);
    }
  }

  if (cover) {
    try {
      const coverPath = await fileUpload(cover);

      coverArtId = coverPath.public_id;
      coverArt = coverPath.secure_url;
    } catch (error) {
      console.log(error);
    }
  }

  const song = await Song.create({
    user: req.user.id,
    country: req.user.location,
    fileUrl,
    fileId,
    coverArt,
    coverArtId,
    ...req.body,
  });

  song.slug = `${song.id}/${slugify(req.body.artist, { separator: '_' })}/${slugify(req.body.name)}`;

  song.save();

  return res.status(201).json({
    status: 'success',
    song
  });
});

export const getUserSongs = catchAsync(async (req, res, next) => {
  const songs = await Song.find({ user: req.user.id });

  res.status(201).json(songs);
});

export const getLikedSongs = catchAsync(async (req, res, next) => {
  const songs = await LikedSong.findOne({ user: req.user.id }).populate({
    path: 'songs',
    select: 'fileUrl coverArt artist name user featured likes id trackLength duration',
  });

  if (songs) {
    res.status(200).json(songs);
  } else {
    res.status(200).json({
      user: req.user.id,
      songs: [],
    });
  }
});

export const search = catchAsync(async (req, res, next) => {
  const queryTitle = new RegExp(req.query?.title, 'i');

  if (queryTitle !== '') {
    try {
      const song_results = await Song.find({ name: queryTitle });
      const playlist_results = await Playlist.find({ name: queryTitle });
      const user_results = await User.find({ username: queryTitle });

      res.status(200).json({
        users: user_results,
        songs: song_results,
        playlists: playlist_results,
      });
    } catch (error) {
      console.log(error);
      res.status(404).json({ message: 'No results found' });
    }
  } else {
    res.status(200).json({
      users: [],
      songs: [],
      playlists: [],
    });
  }
});

export const getRecentSongs = catchAsync(async (req, res, next) => {
  const songs = await Song.aggregate([{ $sample: { size: 10 } }]);

  if (songs) {
    res.status(200).json(songs);
  }
});

export const getTrendingSongs = catchAsync(async (req, res, next) => {
  const sortBy = 'likes';
  const orderBy = 1 | -1 | 'asc' | 'desc' | 'ascending' | 'descending';
  const songs = await Song.aggregate()
    .addFields({ length: { $size: `$${sortBy}` } }) //adds a new field, to the existing ones (incl. _id)
    .sort({ length: orderBy });
  return res.json(songs);
});

export const getAllSongs = catchAsync(async (req, res, next) => {
  const { page, size, location } = req.query;

  let filter = {};

  if (location !== 'all') {
    filter = { country: location };
  }
  const options = {
    page: 1,
    limit: parseInt(size),
    collation: {
      locale: 'en',
    },
    // populate: "user",
    sort: { uploaded: -1 },
  };

  await Song.paginate(filter, options, function (err, result) {
    res.send({
      totalItems: result.totalDocs,
      songs: result.docs,
      totalPages: result.totalPages,
      currentPage: result.page,
      limit: result.limit,
    });
  });
});

export const likeSong = catchAsync(async (req, res, next) => {
  const song = await Song.findById(req.params.id);

  if (!song) {
    return next(new ApiError(400, 'Song not found'));
  }

  if (song.likes.includes(req.user.id)) {
    const index = song.likes?.indexOf(req.user.id);
    song.likes?.splice(index, 1);
    await song.save((err) => {
      err && console.log(err);
    });

    const userLikes = await LikedSong.findOne({ user: req.user.id });

    if (userLikes) {
      const index = userLikes.songs?.indexOf(song.id);
      userLikes.songs.splice(index, 1);
      await userLikes.save();
    }

    await Notification.deleteMany({
      to: song?.user,
      user: req?.user?.id,
      type: 'Single',
      song: song.id,
    });

    res.status(200).json({
      status: 'success',
      message: 'unliked',
      song,
    });
  } else {
    const userLikes = await LikedSong.findOne({ user: req.user.id });

    if (userLikes) {
      userLikes.songs.push(song.id);
      await userLikes.save();
    } else {
      await LikedSong.create({
        user: req.user.id,
        songs: new Array(song.id),
      });
    }
    song.likes?.push(req.user.id);
    await song?.save((err) => {
      err && console.log(err);
    });

    if (req.user.id.toString() != song?.user?.toString()) {
      await Notification.create({
        user: req?.user?.id,
        to: new Array(song?.user),
        type: 'Single',
        message: `${req.user?.username} liked your song - ${song.name}`,
        seen: new Array(req?.user?.id),
        song: song.id,
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'liked',
      song,
    });
  }
});

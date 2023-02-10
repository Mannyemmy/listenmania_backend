// @ts-nocheck
import {
  uploadSong,
  getUserSongs,
  getAllSongs,
  likeSong,
  getLikedSongs,
  getRecentSongs,
  getTrendingSongs,
  search,
} from './../../modules/songs/controllers/song.controller';
import { authController } from '../../modules/auth';
import express, { Router } from 'express';
import { createGenre, getAllGenres, createPlaylist } from '../../modules/songs/controllers/playlist.controller';
import { upload } from '../../modules/utils/multer';

const router: Router = express.Router();

router.get('/search', search);
router
  .route('/')
  .get(getAllSongs)
  .post(
    authController.protect,
    upload.fields([
      {
        name: 'audio',
        maxCount: 1,
      },
      {
        name: 'cover',
        maxCount: 1,
      },
    ]),
    uploadSong
  );

router.route('/liked').get(authController.protect, getLikedSongs);

router.route('/like/:id').put(authController.protect, likeSong);

router.route('/genre').get(getAllGenres).post(upload.single('file'), createGenre);

router.route('/library').get(authController.protect, getUserSongs);

router.route('/recent').get(getRecentSongs);
router.route('/trending').get(getTrendingSongs);

// router.route('/:id').get(getPostById).delete(authController.protect, deletePost);

// router.route('/:id/like/').put(authController.protect, likePost);

export default router;

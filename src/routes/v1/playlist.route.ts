// @ts-nocheck
import { authController } from '../../modules/auth';
import express, { Router } from 'express';
import {
  addToPlaylist,
  createPlaylist,
  populateCountry,
  getAllPlaylists,
  getUserPlaylists,
  getSinglePlaylist,
  likePlaylist,
  subscribePlaylist,
  getSubscribedPlaylists,
  getLikedPlaylists,
  getRecentPlaylists,
} from '../../modules/songs/controllers/playlist.controller';
import { upload } from '../../modules/utils/multer';

const router: Router = express.Router();

router
  .route('/')
  .get(authController.protect, getUserPlaylists)
  .post(authController.protect, upload.single('file'), createPlaylist);

router.get('/countries', populateCountry)

router.route('/song/:id').put(authController.protect, addToPlaylist);

router.route('/like/').get(authController.protect, getLikedPlaylists);

router.route('/subscribe/').get(authController.protect, getSubscribedPlaylists);

router.route('/recent').get(getRecentPlaylists);

router.route('/like/:id').put(authController.protect, likePlaylist);

router.route('/subscribe/:id').put(authController.protect, subscribePlaylist);

router.route('/:id').get(getSinglePlaylist);

export default router;

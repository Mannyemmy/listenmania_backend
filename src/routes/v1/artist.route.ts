import express from 'express';
const router = express.Router();
import {
  followArtist,
  likeArtist,
  getRecentArtists,
  getLikedArtists,
  getFollowedArtists,
} from '../../modules/songs/controllers/artist.controller';

import { authController } from '../../modules/auth';

const protect = authController.protect;

//commentReply
router.route('/').get(getRecentArtists);
router.get('/liked', protect, getLikedArtists);
router.get('/followed', protect, getFollowedArtists);

router.route('/:id/like').put(protect, likeArtist);
router.route('/:id/follow').put(protect, followArtist);

export default router;

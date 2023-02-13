import express from 'express';
const router = express.Router();
import { followArtist, likeArtist, getRecentArtists } from '../../modules/songs/controllers/artist.controller';

import { authController } from '../../modules/auth';

const protect = authController.protect;

//commentReply
router.route('/').get(getRecentArtists);

router.route('/:id/like').put(protect, likeArtist);
router.route('/:id/follow').put(protect, followArtist);

export default router;

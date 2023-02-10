// @ts-nocheck
import { authController } from '../../modules/auth';
import express, { Router } from 'express';
import { createPost, getAllPost, deletePost, likePost, getPostById } from '../../modules/posts/post.controller';
import { upload } from '../../modules/utils/multer';

const router: Router = express.Router();

router.route('/').get(authController.protect, getAllPost).post(authController.protect, upload.array('files'), createPost);

router.route('/:id').get(getPostById).delete(authController.protect, deletePost);

router.route('/:id/like/').put(authController.protect, likePost);

export default router;

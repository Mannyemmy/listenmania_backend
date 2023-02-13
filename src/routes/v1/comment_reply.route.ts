// @ts-nocheck
import express from 'express';
const router = express.Router();
import {
  addCommentReply,
  checkComment,
  getCommentReplies,
  likeCommentReply,
  deleteCommentReply,
} from '../../modules/posts/commentReply.controller';

import { authController } from '../../modules/auth';

const protect = authController.protect;

//commentReply
router.route('/').post(protect, checkComment, addCommentReply);

router.route('/:id/like').put(protect, likeCommentReply);

router.route('/:id').get(getCommentReplies);

router.route('/:id/:commentId').delete(protect, checkComment, deleteCommentReply);

export default router;

// @ts-nocheck
import express from 'express';
const router = express.Router();
import { addComment, checkPost, likeComment, deleteComment, getPostComments } from '../../modules/posts/comments.controller';

// const {
//             createComment,
//             likeReply,
//             checkComment,
//             deleteReply

// } = require("../controllers/replyController")
import { authController } from '../../modules/auth';

const protect = authController.protect;

router.route('/:id').get(getPostComments);

//router.route("/:id").get(getComment)

//comment
router.route('/:id').post(protect, checkPost, addComment);

router.route('/like/:id').patch(protect, likeComment);

router.route('/:id/:commentId').delete(protect, checkPost, deleteComment);

//reply

// router.route('/reply/:id').post(protect, checkComment, createComment);

// router.route('/reply/like/:id/:replyId').patch(protect, checkComment, likeReply).delete(protect, checkComment, deleteReply);

export default router;

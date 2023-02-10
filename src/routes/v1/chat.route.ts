import { authController } from '../../modules/auth';
import express, { Router } from 'express';
import { validate } from '../../modules/validate';
import * as chatController from '../../modules/chat/chat.controller'





const router: Router = express.Router();


router.post('/initiate',authController.protect, chatController.initiateChat )
router.get('/',authController.protect, chatController.getContacts )
router.get('/single/:roomId',authController.protect, chatController.getChatRoomById )
router.get('/:roomId',authController.protect, chatController.getMessagesByChatId )
router.post('/:roomId/message',authController.protect, chatController.postMessage )








export default router;
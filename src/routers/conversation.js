import { Router } from 'express';
import { createConversation, getConversationList, getAllConversation } from '../controller/conversation.controller.js';
import { AuthMiddleware } from '../middleware/auth.middleware.js';

const conversationRouter = Router();
conversationRouter.post('/new', AuthMiddleware.authenticated, AuthMiddleware.setCurrentUser, createConversation);
conversationRouter.get( '/list', AuthMiddleware.authenticated, AuthMiddleware.setCurrentUser, getConversationList);
conversationRouter.get( '/', AuthMiddleware.authenticated, AuthMiddleware.setCurrentUser, getAllConversation);

export default conversationRouter;
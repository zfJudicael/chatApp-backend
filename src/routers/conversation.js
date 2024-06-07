import { Router } from 'express';
import { createConversation, getConversationsList, getFullConversation } from '../controller/conversation.controller.js';
import { AuthMiddleware } from '../middleware/auth.middleware.js';

const conversationRouter = Router();
conversationRouter.post('/new', AuthMiddleware.authenticated, AuthMiddleware.setCurrentUser, createConversation);
conversationRouter.get( '/list', AuthMiddleware.authenticated, AuthMiddleware.setCurrentUser, getConversationsList);
conversationRouter.get( '/:_id', AuthMiddleware.authenticated, AuthMiddleware.setCurrentUser, getFullConversation);

export default conversationRouter;
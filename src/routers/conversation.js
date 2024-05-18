import { Router } from 'express'
import { get_all_conversation } from '../controller/conversation.controller.js'

const conversationRouter = Router()
conversationRouter.get( '/', get_all_conversation)

export default conversationRouter;
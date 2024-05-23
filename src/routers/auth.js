import express from 'express';
import { signUp, signIn } from '../controller/auth.controllers.js';

const authRouter = express.Router();

authRouter.post('/new', signUp)

authRouter.post('/login', signIn);

export default authRouter; 

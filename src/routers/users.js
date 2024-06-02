import express from 'express';
import { get_all, get_by_id, updateOne, deleteOne, checkUser } from '../controller/user.controllers.js';
import {authMiddleware} from '../middleware/auth.middleware.js';

const userRouter = express.Router();

//Log in
userRouter.get("/check", checkUser);

//Get a list of all users
userRouter.get('/', authMiddleware, get_all)

//Get a single user by id
userRouter.get("/:id", get_by_id);

//Update a user by id
userRouter.patch("/:id", updateOne);
  
//Delete a user by id
userRouter.delete("/:id", deleteOne);
  

export default userRouter;
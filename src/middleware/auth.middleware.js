import Jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { ObjectId } from 'mongodb';
const jwtPrivateKey = process.env.PRIVATE_KEY;

const authMiddleware = async function (req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).send({success: false, message:'Access denied. No token provided.'});

  try {
    const decoded = Jwt.verify(token, jwtPrivateKey);
    let result = await User.findById(new ObjectId(decoded._id))
    if(!result) {
      res.status(404).json({success: false, message: 'User not found'});
    }else {
      next();
    }
  }
  catch (err) {
    res.status(400).json({success: false, message: err.message});
  }
}



class AuthMiddleware{
  static async authenticated(req, res, next){
    try {
      const token = req.headers.authorization;
      if(!token) throw new Error('TOKEN_NOT_PROVIDED')

      const decoded = Jwt.verify(token, jwtPrivateKey);
      const user = await User.findById(new ObjectId(decoded._id)).select(('-password'))
      if(!user) throw new Error('USER_NOT_FOUND')
      
      next()
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'PLEASE_AUTHENTICATE'
      })
    }
  }

  static async setCurrentUser(req, res, next){
    try {
      const token = req.headers.authorization;
      const decoded = Jwt.verify(token, jwtPrivateKey);
      const user = await User.findById(new ObjectId(decoded._id)).select(('-password'))
      req.currentUser = user;
      
      next()
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'PLEASE_AUTHENTICATE'
      })
    }
  }
}

export {
  authMiddleware,
  AuthMiddleware
}
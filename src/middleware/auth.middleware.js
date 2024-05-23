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
      // req.user = decoded; 
      next();
    }
  }
  catch (err) {
    res.status(400).json({success: false, message: err.message});
  }
}

export default authMiddleware;
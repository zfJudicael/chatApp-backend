import Joi from 'joi';
import bcrypt from 'bcrypt';
import { User } from '../models/user.model.js';
import express from 'express';
const authRouter = express.Router();

authRouter.post('/', async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).json({success: false, message: error.details[0].message, token: ''});

  let user = await User.findOne({ pseudo: req.body.pseudo });
  if (!user) return res.status(400).json({success: false, message: 'Pseudo does not match to any User', token: ''});

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).json({success: false, message: 'Invalid password.', token: ''});

  const user1 = new User(user)
  const token = user1.generateAuthToken();
  res.json({success: true, message: 'Authenticated successfully', token});
});

function validate(user) {
    const schema = Joi.object({
        pseudo: Joi.string().required(),
        password: Joi.string().min(5).required()
    })
    
    return schema.validate(user)
}

export default authRouter; 

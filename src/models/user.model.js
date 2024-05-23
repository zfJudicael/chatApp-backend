import mongoose from 'mongoose';
import Jwt from 'jsonwebtoken';
import Joi from 'joi'
const jwtPrivateKey = 'chatAppPrivateKey';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  pseudo: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    minlength: 5,
    required: true
  }
}, { timestamps: true });

userSchema.methods.generateAuthToken = function(){
  const payload = { _id: this._id, pseudo: this.pseudo }
  const token = Jwt.sign(payload, jwtPrivateKey, { expiresIn: '1d' })
  return token
}

const User = mongoose.model('User', userSchema);

function validateUser(user){
  const schema = Joi.object({
    email: Joi.string().email().required(),
    pseudo: Joi.string().required(),
    password: Joi.string().min(5).required(),
  })

  return schema.validate(user)
}

export {
  userSchema,
  User,
  validateUser
}
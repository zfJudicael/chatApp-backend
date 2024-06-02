import Joi from 'joi';
import bcrypt from 'bcrypt';
import { User, validateUser } from '../models/user.model.js';
import Jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb'


const checkEmailInUse = async (email)=>{
    let result = await User.findOne({ email : email })
    return result ? true : false
}
  
const checkPseudoInUse = async (pseudo) => {
    let result = await User.findOne({ pseudo: pseudo })
    return result ? true : false
}

function validatePayload(payload) {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(5).required()
    })
    
    return schema.validate(payload)
}
  
const signUp = async (req, res) => {
    let status;
    let response = {
      success: false,
      message: ''
    }
    
    try {
        const { error } = validateUser(req.body)
  
        if (error) {
            status = 400
            response.message = error.details[0].message
        } else {
            const isEmailInUse = await checkEmailInUse(req.body.email)
            if(isEmailInUse){
                status = 400
                response.message = 'EMAIL_ALREADY_PICKED';
            }else{
                const isPseudoInUse = await checkPseudoInUse(req.body.pseudo)
                if (isPseudoInUse) {
                    status = 400
                    response.message = 'PSEUDO_ALREADY_PICKED';
                } else {
                    let user = new User({
                        email: req.body.email,
                        pseudo: req.body.pseudo,
                        password: req.body.password
                    })
                    const salt = await bcrypt.genSalt(10)
                    user.password = await bcrypt.hash(user.password, salt)
  
                    await user.save()
                    status = 200
                    response.success = true
                    response.message = 'USER_CREATED'
                }
            }
        }
    } catch (err) {
      status = 500
      response.message = err.message
    }
    res.status(status).json(response)
  }
  

const signIn = async (req, res)=>{
    const { error } = validatePayload(req.body); 
    if (error) return res.status(400).json({success: false, message: error.details[0].message, token: ''});
  
    let userFounded = await User.findOne({ email: req.body.email });
    if (!userFounded) return res.status(400).json({success: false, message: 'USER_NOT_FOUND', token: ''});
  
    const validPassword = await bcrypt.compare(req.body.password, userFounded.password);
    if (!validPassword) return res.status(400).json({success: false, message: 'INVALID_PASSWORD', token: ''});
  
    const user = new User(userFounded)
    const token = user.generateAuthToken();
    res.json({success: true, message: 'Authenticated successfully', token});
}


const getMe = async (req, res)=>{
    let response = {
        success: false,
        message: '',
        user : null
    }
    let status;

    const token = req.headers.authorization;
    const jwtPrivateKey = process.env.PRIVATE_KEY;
    if(token){
        try {
            const decoded = Jwt.verify(token, jwtPrivateKey);
            let result = await User.findById(new ObjectId(decoded._id)).select(('-password'))
            if (!result) {
                status = 404
                response.message = 'USER_NOT_FOUND'
            } else {
                status = 200
                response.user = result
                response.success = true
            };
        } catch (error) {
            status = 500
            response.message = 'NOT_VALID_OR_EXPIRED_TOKEN'
        } 
    }else{
        status = 403
        response.message = 'TOKEN_MISSED'
    }
    
    return res.status(status).json(response);
}


export {
    signUp,
    signIn,
    getMe
}
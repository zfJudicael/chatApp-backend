import mongoose from "mongoose";
import Jwt from 'jsonwebtoken';
const jwtPrivateKey = 'chatAppPrivateKey';

//Message
const messageSchema = new mongoose.Schema({
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    to: mongoose.Schema.Types.ObjectId,
    value: String,
    createdAt: { type: Date, default: ()=>Date.now()}
})

const Message = mongoose.model('Message', messageSchema)

//Conversation
const conversationSchema = new mongoose.Schema({
    name: String,
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    messages: [ messageSchema ]
}, { timestamps: true });

conversationSchema.methods.generateConvToken = function(){
    const payload = { _id: this._id }
    const token = Jwt.sign(payload, jwtPrivateKey, { expiresIn: '1d' })
    return token
}

const Conversation = mongoose.model('Conversation', conversationSchema)

export {
    Conversation,
    Message
}
import mongoose from "mongoose";

//Message
const messageSchema = new mongoose.Schema({
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    value: String,
    createdAt: { type: Date, default: Date.now()}
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

const Conversation = mongoose.model('Conversation', conversationSchema)

export {
    Conversation,
    Message
}
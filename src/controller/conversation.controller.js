import { Conversation, Message } from "../models/conversation.model.js"
import { ObjectId } from "mongodb";
import Jwt from 'jsonwebtoken';
import { User } from "../models/user.model.js";

const createConversation = async (userToken, conversationName, socket, callback)=>{
    let error;
    let result;
    try {
        const jwtPrivateKey = process.env.PRIVATE_KEY;
        const decoded = Jwt.verify(userToken, jwtPrivateKey);

        const user = await User.findById(new ObjectId(decoded._id)).select(('-password'))

        if(!user) throw new Error('USER_NOT_FOUND')

        const conversation = new Conversation({name: conversationName, members: [user._id]})
        result = await conversation.save() 

        socket.join(result.id)
    } catch (err) {
        error = err
    }
    callback(error, result)
}

const getConversationsList = async (req, res)=>{
    let status;
    let response = {
        success: false,
        conversationList: []
    }
    try {
        response.conversationList = await Conversation.find({ members: req.currentUser._id })
                                        .select(('-messages'))
                                        .sort({ updatedAt : -1 })
        status = 200;
        response.success = true;
    } catch (error) {
        status = 500
    }
    res.status(status).json(response)
}

const getFullConversation = async (req, res)=>{
    let status;
    let response = {
        success: false,
        conversation: null
    }
    try {
        let result = await Conversation.findById(new ObjectId(req.params._id)) 
        response.conversation = {
            _id: result._id,
            members: result.createdAt,
            messages: result.messages,
            name: result.name,
            token: result.generateConvToken(),
            createdAt: result.createdAt,
            updatedAt: result.updatedAt,
        }
        status = 200;
        response.success = true;
    } catch (error) {
        status = 500
    }
    res.status(status).json(response)
}

const joinConversation = async (conversationToken, userId, socket, callback)=>{
    let error;
    let result;
    try {
        const jwtPrivateKey = process.env.PRIVATE_KEY;
        const decoded = Jwt.verify(conversationToken, jwtPrivateKey);
        const conversation = await Conversation.findById(new ObjectId(decoded._id))
                                        .select(('-messages'))
        if(!conversation) throw new Error('CONVERSATION_NOT_FOUND')

        const isMember = conversation.members.some((membersId)=>{ membersId.equals(userId)});
        if(!isMember) {
            result = conversation;
            throw new Error('USER_ALREADY_MEMBER_OF_THE_CONVERSATION')
        }
        
        conversation.members.push(userId)
        result = await conversation.save()
        socket.join(result.id)
    } catch (err) {
        error = err.message
    }
    callback(error, result)
}

const addMessage = async (message, socket, callback)=>{
    try {
        const conversation = await Conversation.findById(message.to)
        if(!conversation) throw new Error('CONVERSATION_NOT_FOUND')

        const newMessage = new Message(message)
       
        conversation.messages.push(newMessage)
        await conversation.save()
        socket.broadcast.to(conversation.id).emit('newMessage', newMessage)
        callback(null, newMessage)
    } catch (error) {
        callback(error)
    }
}

export {
    createConversation,
    getConversationsList,
    getFullConversation,
    joinConversation,
    addMessage
}
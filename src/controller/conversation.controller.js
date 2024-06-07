import { Conversation, Message } from "../models/conversation.model.js"
import { ObjectId } from "mongodb";
import Jwt from 'jsonwebtoken';

const createConversation = async (req, res)=>{
    let status;
    let response = {
        success: false,
        message: '',
        conversation: null
    }
    try {
        let tempConvesation = req.body.conversation
        const conversation = new Conversation({name: tempConvesation.name, members: [req.currentUser._id]})
        const newConversation = await conversation.save()   
        response.success = true
        response.message = 'CONVERSATION_CREATED'
        response.conversation = newConversation
        status = 200
    } catch (error) {
        response.success = false
        response.message = 'CONVERSATION_NOT_CREATED'
        status = 500
    }
    res.status(status).json(response)
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

const joinConversation = async (token, userId, io, callback)=>{
    let error;
    let result;
    try {
        const jwtPrivateKey = process.env.PRIVATE_KEY;
        const decoded = Jwt.verify(token, jwtPrivateKey);

        const conversation = await Conversation.findById(new ObjectId(decoded._id))
                                        .select(('-messages'))
        if(!conversation) throw new Error('CONVERSATION_NOT_FOUND')

        conversation.members.push(userId)
        result = await conversation.save()
    } catch (err) {
        error = err.message
    }
    callback(error, result)
}

const addMessage = async (message, socket, callback)=>{
    try {
        const newMessage = new Message(message)
        const conversation = await Conversation.findById(message.to)
        if(!conversation) throw new Error('CONVERSATION_NOT_FOUND')
        
        conversation.messages.push(newMessage)
        await conversation.save()
        socket.broadcast.to(conversation.id).emit('newMessage')
        callback()
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
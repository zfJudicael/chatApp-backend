import { Conversation } from "../models/conversation.model.js"

const createConversation = async (req, res)=>{
    let status;
    let response = {
        success: false,
        message: '',
        conversation: []
    }
    try {
        let tempConvesation = req.body.conversation
        const conversation = new Conversation({name: tempConvesation.name, members: [req.currentUser._id]})
        const newConversation = await conversation.save()   
        response.success = true
        response.message = 'CONVERSATION_CREATED'
        response.conversation.push(newConversation)
        status = 200
    } catch (error) {
        response.success = false
        response.message = 'CONVERSATION_NOT_CREATED'
        status = 500
    }
    res.status(status).json(response)
}

const getConversationList = async (req, res)=>{
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

const getAllConversation = async (req, res)=>{
    let status;
    let response = {
        success: false,
        conversation: []
    }
    try {
        response.conversation = await Conversation.find({ members: req.currentUser._id }).sort({ updatedAt : -1 })
        status = 200;
        response.success = true;
    } catch (error) {
        status = 500
    }
    res.status(status).json(response)
}

const addMessage = (message)=>{
    try {
        const result = await Conversation.updateOne({})
    } catch (error) {
        
    }
}

export {
    createConversation,
    getConversationList,
    getAllConversation
}
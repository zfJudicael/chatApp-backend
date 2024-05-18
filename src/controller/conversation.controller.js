import { Conversation } from "../models/conversation.model.js"

const createConversation = async (userId, name)=>{
    try {
        const conv = new Conversation({name: name, members: [userId]})
        await conv.save()   
    } catch (error) {
        throw error;
    }
}

const get_all_conversation = async (req, res)=>{
    let status;
    let result = []
    try {
        result = await Conversation.find()
        status = 200
    } catch (error) {
        status = 500
    }
    res.status(status).json(result)
}

export {
    createConversation,
    get_all_conversation
}
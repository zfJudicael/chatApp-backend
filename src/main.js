import express from 'express';
import 'dotenv/config';
import userRouter from './routers/users.js';
import authRouter from './routers/auth.js';
import conversationRouter from './routers/conversation.js';
import mongoose from 'mongoose';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io'
import { Message, Conversation } from './models/conversation.model.js';
import { addMessage, joinConversation } from './controller/conversation.controller.js';
import { getMe } from './controller/auth.controllers.js';


const corsOptions = {
    origin: process.env.CORS_ORIGIN,
};

const app = express()

app.use(cors(corsOptions))

const server = createServer(app)
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN
    }
})

//////////////////////////////////////////////////////////////
mongoose.connect(`${process.env.DATABASE_URI}${process.env.DATABASE_NAME}`)
    .then(()=> console.log('Connected to MongoDb...'))
    .catch((err)=> console.log('Cannot connect to MongoDb...'))
//////////////////////////////////////////////////////////////


io.on('connection', (socket)=>{
    socket.on('logIn', async (userId)=>{
        if(userId){
            try {
                const result = await Conversation.find({ members: userId }).select(('-name -members -messages -createdAt -updatedAt'))
                let room = []
                result.forEach((conv)=>{
                    room.push(conv.id)
                })
                if(room.length > 0) socket.join(room)
            } catch (error) {
                console.log(error)
            }
        }else{
            socket.disconnect()
        }
    })

    socket.on('joinConversation', (token, userId, callback)=>joinConversation(token, userId, io, callback))
    socket.on('sendMessage', (message, callback)=>addMessage(message, socket, callback))
})


//middleware & static files
app.use(express.urlencoded({ extended: true }));

app.use(express.json())
app.use('/auth', authRouter)
app.get('/api/me', getMe)
app.use('/api/user', userRouter)
app.use('/api/conversation', conversationRouter)


server.listen(process.env.PORT, ()=> console.log(`Listening on port ${process.env.PORT}...`))
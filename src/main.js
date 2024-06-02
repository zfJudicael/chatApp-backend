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
import { createConversation } from './controller/conversation.controller.js';
import { getMe } from './controller/auth.controllers.js';
// import { AuthMiddleware } from './middleware/auth.middleware.js';


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
    console.log('A user connected');

    // socket.on('createConversation', async (userId, name, callback)=>{
    //     try {
    //         await createConversation(userId, name)
    //     } catch (error) {
    //         console.log(error)
    //         callback(error)
    //     }
    // })

    socket.on('sendMessage', (message)=>{
        console.log(message)
    })
})

//middleware & static files
app.use(express.urlencoded({ extended: true }));

app.use(express.json())
app.use('/auth', authRouter)
app.get('/api/me', getMe)
app.use('/api/user', userRouter)
app.use('/api/conversation', conversationRouter)

// app.post('/test', AuthMiddleware.authenticated, (req, res)=>{
//     console.log('Okay')
// })

server.listen(process.env.PORT, ()=> console.log(`Listening on port ${process.env.PORT}...`))
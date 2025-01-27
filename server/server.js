import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import auth from './routes/auth.js'
import cookieParser from 'cookie-parser'
import cookie from 'cookie'
import { disconnectUser, getIdFromUser, getUserFromId, registerUser, Message } from './socketServices/chat.js'
import root from './routes/root.js'
import { restrictedRoute, softAuthCheck } from './middleware/auth.js'
import { getUser } from './service/auth.js'
import helmet from 'helmet'
import cors from 'cors'
import { config } from 'dotenv'
import user from './routes/user.js'
import chatRouter from './routes/chat.js'
config()

const PORT = process.env.PORT || 8080
const app = express()
const server = http.createServer(app)
const DEV_MODE = process.env.DEV_MODE == 'true'
app.use(cors({
    origin: DEV_MODE ? "http://localhost:5173" : "https://tether-xi.vercel.app",
    credentials: true
}))

app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())
app.use(express.static("public"))
app.use(softAuthCheck)
app.set("view engine", "ejs")

app.use('/auth', auth)
app.use('/user', user)

// chat data 
app.use('/chat', restrictedRoute, chatRouter)

// root
app.use('/', root)

app.use((req, res) => {
    res.status(404).json({success: false, msg: "invalid endpoint!"})
})


// Socket.io
const io = new Server(server)


const checkUndeliveredMsg = async (socketId, userID) => {
    const undeliverdMessages = await Message.getNotDeliveredMsg(userID)
    if (undeliverdMessages) {
        io.to(socketId).emit("waited:messages", undeliverdMessages)
    }
}

io.use((socket, next) => {
    const token = cookie.parse(socket.request.headers.cookie || '')?.secret
    if (!token) {
        return next(new Error("unauthorized!"))
    }
    const user = getUser(token)
    // console.log(user)
    // console.log(token)
    if (!user) return next(new Error("unauthorized!"))
    registerUser(socket.id, user.id)
    checkUndeliveredMsg(socket.id, user.id)
    next()
})

io.on('connection', (socket) => {
    console.log("A new user Connected", socket.id)

    socket.on("message:send", async ({reciver, content}) => { // private chat
        const sender = getUserFromId(socket.id)
        console.log(reciver, content)
        if (!reciver || !content) {
            return io.to(socket.id).emit('message:send:error', "error")
        }
        const reciversSocketId = getIdFromUser(reciver)
        if (reciversSocketId) {
            const msg = await Message.pushMessage({ sender, reciver, content, tick: 2 })
            io.to(reciversSocketId).emit("message:recive" , msg)
            return io.to(socket.id).emit("message:tick", {msg_id: msg?.id, tick: msg?.tick})
        } else {
            Message.pushMessage({ sender, reciver, content })
        }
    })

    socket.on("message:see", ({sender}) => {
        if (!sender) return
        const reciver = getUserFromId(socket.id)
        const senderId = getIdFromUser(sender)
        io.to(senderId).emit("message:seen", reciver)
        sender && reciver && Message.seen({
            sender,
            reciver
        })
    })

    socket.on('message:delete', async (req) => {
        const { msg_id } = req
        if (!msg_id) {
            console.log(req, "op")
            return
        }
        const sender = getUserFromId(socket.id)
        try {
            const reciver = await Message.delete({ sender, msg_id })
            // console.log(reciver)
            if (reciver) {
                // console.log(res)
                const reciver_socket_id = getIdFromUser(reciver)
                if (reciver_socket_id) {
                    // console.log(reciver)
                    io.to(reciver_socket_id).emit('messages:deleted', { msg_id, sender })
                }
            }
        } catch (e) {
            console.log(e)
        }
    })

    socket.on('message:edit', async (req) => {
        const { msg_id, newContent } = req
        if (!msg_id || !newContent) {
            console.log(req)
            return
        }
        const sender = getUserFromId(socket.id)
        try {
            const res = await Message.edit({ msg_id, newContent, sender })
            if (res) {
                // console.log(res)
                const reciver = getIdFromUser(res.reciver)
                if (reciver) {
                    // console.log(reciver)
                    io.to(reciver).emit('messages:edited', { newContent, msg_id, edited_at: res.edited_at, sender })
                }
            }
        } catch (e) {
            console.log(e)
        }
    })
    socket.on('disconnect', () => {
        disconnectUser(socket.id)
        console.log(socket.id, "disconnected")
      })
})


server.listen(8080, () => {
    console.log(`http://localhost:${PORT}`)
})
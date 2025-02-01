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
export const io = new Server(server, {
    cors: {
        origin: DEV_MODE ? "http://localhost:5173" : "https://tether-xi.vercel.app",
        credentials: true
      }
})


io.use((socket, next) => {
    const token = cookie.parse(socket.request.headers.cookie || '')?.secret
    if (!token) {
        return next(new Error("unauthorized!"))
    }
    const user = getUser(token)
    // console.log(token)
    if (!user) return next(new Error("unauthorized!"))
    socket.user = user
    registerUser(socket.id, user.id)
    Message.sendUndelivered(socket.id, user.id)
    next()
})

io.on('connection', (socket) => {
    // console.log(socket.user)
    console.log(socket.user.username, "connected")

    socket.on("message:send", async ({reciver, content}, ackFunc) => { // private chat
        const { id:sender } = socket.user
        console.log(reciver, content)
        if (!ackFunc) return
        if (!reciver || !content) {
            // return io.to(socket.id).emit('message:send:error', "error")
            return ackFunc("error")
        }
        const reciversSocketId = getIdFromUser(reciver)
        if (reciversSocketId) {
            const msg = await Message.pushMessage({ sender, reciver, content, tick: 2 })
            
            if (reciversSocketId != socket.id) {
                io.to(reciversSocketId).emit("message:recive" , msg)
                return ackFunc(msg)
            }
        } else {
            const msg = await Message.pushMessage({ sender, reciver, content })
            return ackFunc(msg)
        }
    })

    socket.on("message:see", async ({sender}) => {
        if (!sender) return
        const { id:reciver } = socket.user
        const senderId = getIdFromUser(sender)
        if (senderId) {
            await Message.seen({
                sender,
                reciver
            })
            return io.to(senderId).emit("message:seen", {reciver, seen_at: Date.now()})
        }
    })

    socket.on('message:delete', async ({msg_id, all = false}) => {
        if (!msg_id && !all) {
            console.log(req, "oo no message id is here!")
            return
        }
        const { id:sender } = socket.user
        try {
            const reciver = await Message.delete({ sender, msg_id, all })
            if (reciver) {
                const reciver_socket_id = getIdFromUser(reciver)
                if (reciver_socket_id) {
                    if (all)
                        io.to(reciver_socket_id).emit('message:deleted:all', { sender })
                    else
                        io.to(reciver_socket_id).emit('message:deleted', { msg_id, sender })
                }
            }
        } catch (e) {
            console.log(e)
        }
    })

    socket.on('message:edit', async ({ msg_id, newContent }) => {
        if (!msg_id || !newContent) {
            return
        }
        const { id:sender } = socket.user
        try {
            const res = await Message.edit({ msg_id, newContent, sender })
            if (res) {
                // console.log(res)
                const reciver = getIdFromUser(res.reciver)
                if (reciver) {
                    // console.log(reciver)
                    io.to(reciver).emit('message:edited', { msg_id, newContent, edited_at: res.edited_at, sender })
                }
            }
        } catch (e) {
            console.log(e)
        }
    })
    socket.on('disconnect', () => {
        disconnectUser(socket.id)
        console.log(socket.user.username, "disconnected")
      })
})


server.listen(8080, () => {
    console.log(`http://localhost:${PORT}`)
})
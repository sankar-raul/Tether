import express from 'express'
import http from 'http'
import https from 'https'
import { Server } from 'socket.io'
import fs from 'fs'
import auth from './routes/auth.js'
import cookieParser from 'cookie-parser'
import cookie from 'cookie'
import { Message } from './socketServices/chat.js'
import { connectUser, disconnectUser, setUserStatus, userIdToSocketId } from './redisStore/redisClient.js'
import root from './routes/root.js'
import { restrictedRoute, softAuthCheck } from './middleware/auth.js'
import { getUser } from './service/auth.js'
import helmet from 'helmet'
import cors from 'cors'
import { config } from 'dotenv'
import user from './routes/user.js'
import chatRouter from './routes/chat.js'
import { AccessToken } from './service/authToken.js'
import NotificationRoute from './routes/pushNotification.route.js'
config()

const options = {
  key: fs.readFileSync('certs/key.pem'),
  cert: fs.readFileSync('certs/cert.pem')
};
const PORT = process.env.PORT || 8443
const app = express()
const DEV_MODE = process.env.DEV_MODE == 'true'
const server = DEV_MODE ? https.createServer({
        key: fs.readFileSync('certs/key.pem'),
        cert: fs.readFileSync('certs/cert.pem')
    }, app) : http.createServer(app)

const allowedOrigins = ["https://192.168.0.11:443", "https://tether-xi.vercel.app"]
app.use(cors({
    origin: (origin, callback) => {
        if (DEV_MODE || !origin) {
            callback(null, true)
        } else if (allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error('Origin not allowed'))
        }
    },
    credentials: true
}));


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

// psuh notification
app.use('/pushNotification', NotificationRoute)

// root
app.use('/', root)

app.use((req, res) => {
    res.status(404).json({success: false, msg: "invalid endpoint!"})
})


// Socket.io
// chat logic
export const io = new Server(server, {
    cors: {
        origin: (origin, callback) => {
            if (DEV_MODE) {
                callback(null, true)
            } else if (origin == "https://tether-xi.vercel.app") {
                callback(null, true)
            } else {
                callback(new Error('Operation not allowed'))
            }
        },
        credentials: true
      }
})


io.use(async (socket, next) => {
    const token = cookie.parse(socket.request.headers.cookie || '')?.access_token
    // console.log(token)
    if (!token) {
        return next(new Error("unauthorized!"))
    }
    const user = AccessToken.get(token)
    // console.log(token)
    if (!user) return next(new Error("unauthorized!"))
    socket.user = user
    await connectUser({user_id: user.id, socket_id: socket.id, socket})
    Message.sendUndelivered(socket.id, user.id)
    next()
})

io.on('connection', async (socket) => {
    // console.log(socket.user)
    console.log(socket.user.id, "connected")

    socket.on('isTyping', async (isTyping) => {
        // console.log(isTyping, socket.user)
        setUserStatus({user_id: socket.user?.id, isTyping: isTyping})
    })
    socket.on("message:send", async ({reciver, content, sent_at}, ackFunc) => { // private chat
        const { id:sender } = socket.user
        // console.log(reciver, content, new Date(sent_at).toLocaleTimeString())
        if (!ackFunc) return
        if (!reciver || !content) {
            // return io.to(socket.id).emit('message:send:error', "error")
            return ackFunc("error")
        }
        const reciversSocketIds = await userIdToSocketId(reciver)
        // console.log(reciversSocketIds)
        let msg
        if (reciversSocketIds.length > 0) {
            msg = await Message.pushMessage({ sender, reciver, content, tick: 2, sent_at })
            if (sender == reciver) {
                ackFunc(msg)
                reciversSocketIds.forEach(s_id => {
                    if (s_id != socket.id) io.to(s_id).emit("message:sync" , msg)
                })
                return
            } else {
                reciversSocketIds.forEach(s_id => {
                    io.to(s_id).emit("message:recive", msg)
                })
                ackFunc(msg)
            }
        } else {
            msg = await Message.pushMessage({ sender, reciver, content, sent_at })
            // console.log(msg, 'op', msg.sent_at, new Date(msg.sent_at).toLocaleString())
            ackFunc(msg)
        }
        const sendersSocketIds = await userIdToSocketId(sender)
        sendersSocketIds.forEach(s_id => {
        if (s_id != socket.id) {
            io.to(s_id).emit("message:sync", msg)
        }
    })
})

    socket.on("message:see", async ({sender}) => {
        if (!sender) return
        // console.log(sender)
        const { id:reciver } = socket.user
        const senderIds = await userIdToSocketId(sender)

        if (senderIds.length > 0) {
            senderIds.forEach(s_id => {
                io.to(s_id).emit("message:seen", {reciver, seen_at: Date.now()})
            })
        }
        const sendersSocketIds = await userIdToSocketId(reciver)
        sendersSocketIds.forEach(s_id => {
        if (s_id != socket.id) {
            io.to(s_id).emit("message:seen", {reciver: sender, seen_at: Date.now(), sync: true})
        }
        })
        // console.log(sender, reciver)
        await Message.seen({
            sender,
            reciver
        })
        return
    })

    socket.on('message:delete', async ({msg_id, all = false}, ackFunc) => {
        if (!msg_id && !all) {
            // console.log(req, "oo no message id is here!")
            return
        }
        const { id:sender } = socket.user
        try {
            const reciver = await Message.delete({ sender, msg_id, all })
            if (reciver) {
                const reciver_socket_ids = await userIdToSocketId(reciver)
                if (reciver_socket_ids.length > 0) {
                    if (all) {
                        reciver_socket_ids.forEach(s_id => {
                            io.to(s_id).emit('message:deleted:all', { sender })
                        })
                        ackFunc ?? ackFunc('success')
                    } else {
                        reciver_socket_ids.forEach(s_id => {
                            io.to(s_id).emit('message:deleted', { msg_id, sender })
                        })
                        ackFunc ?? ackFunc('success')
                    }
                } else {
                    ackFunc('success')
                }
            }

            const sendersSocketIds = await userIdToSocketId(sender)
            sendersSocketIds.forEach(s_id => {
                if (s_id != socket.id) {
                    io.to(s_id).emit(`message:deleted${all ? ':all' : ''}`, {sender: reciver, msg_id, sync: true})
                }
            })
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
                const recivers = await userIdToSocketId(res.reciver)
                if (recivers.length > 0) {
                    // console.log(reciver)
                    recivers.forEach(s_id => {
                        io.to(s_id).emit('message:edited', { msg_id, newContent, edited_at: res.edited_at, sender })
                    })
                }
            }
        } catch (e) {
            console.log(e)
        }
    })

    socket.on('disconnect', async () => {
        await disconnectUser({socket_id: socket.id, socket})
        console.log(socket.user.id, "disconnected")
      })
})


server.listen(PORT, () => {
    console.log(`${DEV_MODE ? 'https' : 'http'}://localhost:${PORT}`)
})
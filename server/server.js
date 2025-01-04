import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import auth from './routes/auth.js'
import cookieParser from 'cookie-parser'
import cookie from 'cookie'
import { disconnectUser, getIdFromUser, getUserFromId, MsgQueue, registerUser } from './socketServices/chat.js'
import root from './routes/root.js'
import { softAuthCheck } from './middleware/auth.js'
import { getUser } from './service/auth.js'

const app = express()
const server = http.createServer(app)

app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())
app.use(express.static("public"))
app.use(softAuthCheck)
app.set("view engine", "ejs")

app.use('/auth', auth)

app.use('/', root)

app.use((req, res) => {
    res.status(404).json({success: false, msg: "invalid endpoint!"})
})


// Socket.io
const io = new Server(server)

const MsgQue = new MsgQueue()

io.use((socket, next) => {
    const token = cookie.parse(socket.request.headers.cookie)
    console.log(socket.request.headers.cookie, socket.id)
    next()
})
io.on('connection', (socket) => {
    console.log("A new user Connected", socket.id)

    socket.on("message:send", (...args) => { // private chat
        const from = getUserFromId(socket.id)
        const { to, msg } = args[0]
        const reciversSocketId = getIdFromUser(to)
        if (reciversSocketId)
            io.to(reciversSocketId).emit("message:recive" , { from, msg })
        else {
            MsgQue.pushMessage({ from, to, msg })
        }
    })


    socket.on("register:user", async (...args) => {
        const secret = args[0]?.secret
        if (!secret) {
            return socket.disconnect()
        }
        const user = getUser(secret)
        if (!user) return socket.disconnect()
        registerUser(socket.id, user.id)
        const undeliverdMessages = await MsgQue.getAll(user.id)
        if (undeliverdMessages) {
            io.to(socket.id).emit("waited:messages", undeliverdMessages)
        }
    })

    socket.on('disconnect', () => {
        disconnectUser(socket.id)
        console.log(socket.id, "disconnected")
      })
})


server.listen(8080, () => {
    console.log(`http://localhost:8080`)
})
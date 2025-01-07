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
import helmet from 'helmet'
import cors from 'cors'
import { config } from 'dotenv'
import user from './routes/user.js'
config()

const app = express()
const server = http.createServer(app)
const DEV_MODE = process.env.DEV_MODE == 'true'
app.use(cors({
    origin: DEV_MODE ? "http://localhost:5173" : "https://tether-xi.vercel.app/",
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
app.use('/', root)

app.use((req, res) => {
    res.status(404).json({success: false, msg: "invalid endpoint!"})
})


// Socket.io
const io = new Server(server)

const MsgQue = new MsgQueue()

const checkUndeliveredMsg = async (socketId, userID) => {
    const undeliverdMessages = await MsgQue.getAll(userID)
    if (undeliverdMessages) {
        io.to(socketId).emit("waited:messages", undeliverdMessages)
    }
}

io.use((socket, next) => {
    const token = cookie.parse(socket.request.headers.cookie || '')?.secret
    if (!token) {
        return next(new Error("unauthorized! token"))
    }
    const user = getUser(token)
    console.log(token)
    if (!user) return next(new Error("unauthorized! oo"))
    registerUser(socket.id, user.id)
    checkUndeliveredMsg(socket.id, user.id)
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

    socket.on('disconnect', () => {
        disconnectUser(socket.id)
        console.log(socket.id, "disconnected")
      })
})


server.listen(8080, () => {
    console.log(`http://localhost:8080`)
})
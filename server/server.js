import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import auth from './routes/auth/auth.js'

const app = express()
const server = http.createServer(app)

app.use(express.json())
app.use('/auth', auth)

app.use((req, res) => {
    res.status(404).json({success: false, msg: "invalid endpoint!"})
})

// Socket.io
const io = new Server(server)

const userToId = new Map()
const idToUser = new Map()

io.on('connection', (socket) => {
    console.log("A new user Connected", socket.id)
    userToId.set("")
    socket.on("message:send", (...args) => {
        console.log(...args)

        io.emit("message:recive" , {userId: socket.id.slice(0, 4), msg: args[0]})
    })


    socket.on("register:user", (...args) => {
        const data = {...args}

    })

    socket.on('disconnect', () => {
        console.log(socket.id ,'disconnected')
      })
})

app.use(express.static("public"))

server.listen(8080, () => {
    console.log(`http://localhost:8080`)
})
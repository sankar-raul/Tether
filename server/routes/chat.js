import express from 'express'
import { getAllMessage } from '../controllers/chat.js'

const chatRouter = express.Router()

chatRouter.get('/all', getAllMessage)


export default chatRouter
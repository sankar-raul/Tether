import express from 'express'
import { getAllMessage } from '../controllers/chat.js'
import pool from '../db/pool.js'

const chatRouter = express.Router()

chatRouter.get('/all', getAllMessage)

// select sender, MAX(sent_at) as latest_msg from messages where reciver = 1 group by sender order by latest_msg;
// select reciver, MAX(sent_at) as latest_msg from messages where sender = 1 group by reciver order by latest_msg;

chatRouter.get('/messages/:id', async (req, res) => {
    const { id } = req.user
    const msg_recived = await pool.execute("select sender, MAX(sent_at) as latest_msg from messages where reciver = ? group by sender order by latest_msg", [id])
    console.log(msg_recived)
    res.end()
})


export default chatRouter
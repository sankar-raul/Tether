import express from 'express'
import { getAllMessage } from '../controllers/chat.js'
import pool from '../db/pool.js'
import { sortContactsListByDateDesc, sortMessagesDesc } from '../utils/algo.js'

const chatRouter = express.Router()

chatRouter.get('/all', getAllMessage)

// select sender, MAX(sent_at) as latest_msg from messages where reciver = 1 group by sender order by latest_msg;
// select reciver, MAX(sent_at) as latest_msg from messages where sender = 1 group by reciver order by latest_msg;

chatRouter.get('/messages/:contact_id', async (req, res) => {
    const { id } = req.user
    const { contact_id } = req.params
    if (id == contact_id) return res.status(400).json({success: false, msg: "bad request!"})
    try {
    const msg_sent = await pool.execute("select * from messages where sender = ? and reciver = ? order by sent_at desc;", [id, contact_id])
    const msg_recived = await pool.execute("select * from messages where sender = ? and reciver = ? order by sent_at desc", [contact_id, id])
    const messages = sortMessagesDesc(msg_sent[0], msg_recived[0])
    res.status(200).json(messages)
    } catch (error) {
        console.log("error")
        return res.status(500).json({success: false, msg: "internal server error!"})
    }
})

chatRouter.get('/contacts', async (req, res) => {
    const { id } = req.user
    try {
    const msg_recived = await pool.execute("select sender, MAX(sent_at) as latest_msg from messages where reciver = ? and tick in (2, 3) group by sender order by latest_msg", [id])
    const msg_sent = await pool.execute("select reciver, MAX(sent_at) as latest_msg from messages where sender = ? group by reciver order by latest_msg", [id])
    const contacts = sortContactsListByDateDesc(msg_recived[0], msg_sent[0])
    console.log(contacts)
    return res.status(200).json({success: true, msg: "data fetch success!", type: "map", data: Object.fromEntries(contacts || [])})
    } catch (error) {
        console.log("error ", error)
        return res.status(500).json({success: false, msg: "internal server error!"})
    }
})

export default chatRouter
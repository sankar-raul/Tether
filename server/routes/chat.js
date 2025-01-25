import express from 'express'
import { getAllMessage } from '../controllers/chat.js'
import pool from '../db/pool.js'

const chatRouter = express.Router()

chatRouter.get('/all', getAllMessage)

// select sender, MAX(sent_at) as latest_msg from messages where reciver = 1 group by sender order by latest_msg;
// select reciver, MAX(sent_at) as latest_msg from messages where sender = 1 group by reciver order by latest_msg;

chatRouter.get('/messages/:id', async (req, res) => {
    const { id } = req.user
    try {
    const msg_recived = await pool.execute("select sender, MAX(sent_at) as latest_msg from messages where reciver = ? group by sender order by latest_msg", [id])
    const msg_sent = await pool.execute("select reciver, MAX(sent_at) as latest_msg from messages where sender = ? group by reciver order by latest_msg", [id])

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
    sortContactsListByDateDesc(msg_recived[0], msg_sent[0])
    return res.status(200).json({success: true, msg: "data fetch success!", data: "ok"})
    } catch (error) {
        console.log("error ", error)
        return res.status(500).json({success: false, msg: "internal server error!"})
    }
})

const sortContactsListByDateDesc = (msg1, msg2) => {
    if (msg1 && msg2) {
        // console.log(new Date(msg1[0].latest_msg).getTime())
        const data = new Map()
        let i = 0, j = 0;
        while (msg1[i] || msg2[j]) {
            if (msg1[i] && msg2[j]) {
                if (new Date(msg1[i].latest_msg).getTime() > new Date(msg2[j].latest_msg).getTime()) {
                    if (data.has(msg1[i].sender)) {
                        if (new Date(data.get(msg1[i].sender).last_msg_at).getTime() < new Date(msg1[i].latest_msg).getTime()) {
                            data.set(msg1[i].sender, {last_msg_at: msg1[i].latest_msg})
                        }
                    } else {
                        data.set(msg1[i].sender, {last_msg_at: msg1[i].latest_msg})
                    }
                    i++
                } else {
                    if (data.has(msg2[j].reciver)) {
                        if (new Date(data.get(msg2[j].reciver).last_msg_at).getTime() < new Date(msg2[j].latest_msg).getTime()) {
                            data.set(msg2[j].reciver, {last_msg_at: msg2[j].latest_msg})
                        }
                    } else {
                        data.set(msg2[j].reciver, {last_msg_at: msg2[j].latest_msg})
                    }
                    j++
                }
            } else if (msg1[i]) {
                data.set(msg1[i].sender, {last_msg_at: msg1[i].latest_msg})
                i++
            } else {
                data.set(msg2[j].reciver, {last_msg_at: msg2[j].latest_msg})
                j++
            }
        }
        return data
    } else {
        return null
    }
    
}

export default chatRouter
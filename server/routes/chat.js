import express from 'express'
import { getAllMessage } from '../controllers/chat.js'
import pool from '../db/pool.js'
import { sortContactsListByDateDesc, sortMessages } from '../utils/algo.js'

const chatRouter = express.Router()

chatRouter.get('/all', getAllMessage)

chatRouter.get('/messages/:contact_id', async (req, res) => {
    const { id } = req.user
    let { part } = req.query
    let { contact_id } = req.params
    const results_per_part = 20
    let offset = 0
    if (part) {
        part = Number(part)
        offset = (part - 1) * results_per_part
    }
    if (!contact_id) return res.status(400).json({success: false, msg: "bad request!"})
    contact_id = Number(contact_id)
    let messages
    try {
        if (id == contact_id) {
            messages = await pool.execute(`select * from messages where sender = ? and reciver = ? order by sent_at limit ${results_per_part} offset ${offset}`, [id, contact_id])
        } else {
            messages = await pool.execute(`(((select * from messages where sender = ? and reciver = ? order by sent_at desc) union (select * from messages where sender = ? and reciver = ? order by sent_at desc)) order by sent_at desc limit ${results_per_part + 1} offset ${offset}) order by sent_at`, [contact_id, id, id, contact_id])
        }
        // const [ msg_sent, msg_recived ] = await Promise.all([pool.execute("select * from messages where sender = ? and reciver = ? order by sent_at", [id, contact_id]), pool.execute("select * from messages where sender = ? and reciver = ? order by sent_at", [contact_id, id])])
        // const messages = sortMessages(msg_sent[0], msg_recived[0])
        const totalResults = messages[0]?.length || 0
        if (totalResults == results_per_part + 1) {
            messages[0]?.shift()
        }
        return res.status(200).json({
            data: messages[0],
            contact_id: contact_id,
            part: part || 1,
            next: totalResults == results_per_part + 1 ? `/chat/messages/${contact_id}?part=${part ? part + 1 : 2}` : null
        })
    } catch (error) {
        console.log("error")
        return res.status(500).json({success: false, msg: "internal server error!"})
    }
})
chatRouter.get('/lastMessage/:id', async (req, res) => {
    const { id } = req.params
    const userID = req.user.id
    try {
        const data = await pool.execute("select sender, reciver, content from messages where sent_at = (select max(sent_at) from messages where (sender = ? and reciver = ?) or (reciver = ? and sender = ?))", [id, userID, id, userID])
        // console.log(data[0][0])
        if (userID != id && !data[0][0]) {
            return res.status(200).json({
                success: true,
                msg: "no chat history found",
                data: null
            })
        } else {
            const unread = await pool.execute('select count(*) as unread from messages where sender = ? and reciver = ? and tick in (1, 2)', [id, userID])
            // console.log(unread)
            return res.status(200).json({
                success: true,
                msg: "success",
                data: {...data[0][0], unread: unread[0][0].unread}
            })
        }
    } catch (error) {
        console.log(error)
        res.status(400).json({succes: false})
    }
})
chatRouter.get('/contacts', async (req, res) => {
    const { id } = req.user
    // console.log(id)
    try {
    // const msg_recived = await pool.execute("select sender, MAX(sent_at) as latest_msg from messages where reciver = ? and tick in (2, 3) group by sender order by latest_msg", [id])
    // const msg_sent = await pool.execute("select reciver, MAX(sent_at) as latest_msg from messages where sender = ? group by reciver order by latest_msg", [id])
    // // console.log(msg_recived, msg_sent)
    // const contacts = sortContactsListByDateDesc(msg_recived[0], msg_sent[0])
    const contacts = await pool.execute('call getContacts(?)', [id])
    // console.log(contacts)
    return res.status(200).json({success: true, msg: "data fetch success!", type: "map", data: contacts[0]?.[0]})
    } catch (error) {
        console.log("error ", error)
        return res.status(500).json({success: false, msg: "internal server error!"})
    }
})

// get contact basic info
chatRouter.get('/c/:id', async (req, res) => {
    const {id} = req.params
    if (!id) {
        return res.status(400).json({success: false, msg: "bad request!"})
    }
    try {
        const data = await pool.execute('select id, username, profile_pic_url, bio from users where id = ?', [id])
        return res.status(200).json({success: true, msg: "success", data: data[0][0]})
    } catch (error) {
        console.log("Error", error)
        return res.status(500).json({success: false, msg: "internal server error!"})

    }
})

export default chatRouter
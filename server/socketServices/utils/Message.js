import pool from "../../db/pool.js"
import { io } from "../../server.js"
import { getIdFromUser } from "../chat.js"

export default class Msg {
    constructor() {

    }
    async pushMessage({sender, reciver, content, tick = 1}) {
        try {
            if (tick == 1) {
                await pool.execute("insert into messages (sender, reciver, content) value (?, ?, ?)", [sender, reciver, content])
            }
            else if (tick == 2) {
                const data = await pool.execute("insert into messages (sender, reciver, content, tick, recived_at) value (?, ?, ?, 2, now())", [sender, reciver, content])
                const msg = await pool.execute("select * from messages where id = ?", [ data[0].insertId ])
                return msg[0][0]
            }
        } catch (error) {
            console.log("Error: here", error)
            throw new Error(error)
        }
    }
    async #getNotDeliveredMsg(reciver) {
        try {
            let [msgs, fields] = await pool.execute("select * from messages where reciver = ? and tick = 1", [reciver])
            await pool.execute("update messages set tick = 2, recived_at = now() where reciver = ? and tick = 1", [reciver])
            return msgs != '' ? msgs : null
        } catch (error) {
            console.log("Error getAll:", error)
        }
    }
    // inform to sender that his / her messages delivered
    async #delevered(msg_id, sender) {
        console.log(msg_id, sender)
        if (msg_id, sender) {
            const senderSocketId = getIdFromUser(sender)
            if (senderSocketId) {
            console.log(senderSocketId)
                io.to(senderSocketId).emit("message:status", {msg_id, tick: 2})
            }
        }
    }
    async sendUndelivered(socketId, userID) {
        const undeliverdMessages = await this.#getNotDeliveredMsg(userID)
        // console.log(undeliverdMessages)
        if (undeliverdMessages) {
            io.to(socketId).emit("waited:messages", undeliverdMessages)
            undeliverdMessages.forEach(message => {
                this.#delevered(message?.id, message?.sender)
            })
        }
    }
    async seen({sender, reciver}) {
        try {
            await pool.execute('update messages set tick = 3, seen_at = now() where sender = ? and reciver = ? and tick = 2', [sender, reciver])
        } catch (e) {
            console.log("Error : ", e)
            throw new Error(e)
        }
    }
    async edit({ sender, msg_id, newContent }) {
        try {
            await pool.execute('update messages set content = ?, edited_at = now() where id = ? and sender = ?', [newContent, msg_id, sender])
            const data = await pool.execute('select reciver, edited_at from messages where id = ?', [msg_id])
            return data[0][0]
        } catch (error) {
            throw new Error(error)
        }
    }
    async delete({sender, msg_id, all}) {
        try {
            let reciver
            if (all) {
                reciver = all?.reciver
            } else {
                reciver = await pool.execute('select reciver from messages where id = ? and sender = ?', [msg_id, sender])
                reciver = reciver[0][0]?.reciver
            }
            if (reciver) {
                if (all)
                    await pool.execute('delete from messages where sender = ? and reciver = ?', [ sender, reciver ])
                else
                    await pool.execute('delete from messages where id = ? and sender = ?', [msg_id, sender])
            }
            return reciver
        } catch (error) {
            throw new Error(error)
        }
    }
    async getAll(userId) { // return all messages related to userId
        try {
            const [msgs, fields] = await pool.execute("select sender, content, sent_at from messages where reciver = ? or sender = ?", [userId, userId])
            return msgs != '' ? msgs : null
        } catch (error) {
            console.log("Error getAll:", error)
        }
    }
}
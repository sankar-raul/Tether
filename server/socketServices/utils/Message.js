import pool from "../../db/pool.js"
import { io } from "../../server.js"
import { userIdToSocketId } from "../../redisStore/redisClient.js"
export default class Msg {
    constructor() {

    }
    async pushMessage({sender, reciver, content, tick = 1, sent_at}) {
        if (!sender || !reciver || !content || !tick || !sent_at) {
            throw new Error('invalid function call')
        }
        const connection = await pool.getConnection()
        try {
            // console.log(sent_at)
            // console.log(new Date(sent_at).toLocaleString())
            sent_at = new Date(sent_at).toLocaleString("en-CA", { 
                year: "numeric", 
                month: "2-digit", 
                day: "2-digit", 
                hour: "2-digit", 
                minute: "2-digit", 
                second: "2-digit", 
                hour12: false 
            }).replace(",", "");
            // console.log(new Date(sent_at).toLocaleString())
            let data
            await connection.execute("call newInteraction(?, ?, ?, ?, ?)", [sender, reciver, sent_at, 'chat', content])
            if (sender == reciver) {
                data = await connection.execute("insert into messages (sender, reciver, content, tick, recived_at, seen_at, sent_at) value (?, ?, ?, 3, now(), now(), ?)", [sender, reciver, content, sent_at])
            } else {
                if (tick == 2)
                    data = await connection.execute("insert into messages (sender, reciver, content, tick, recived_at, sent_at) value (?, ?, ?, 2, now(), ?)", [sender, reciver, content, sent_at])
                else
                    data = await connection.execute("insert into messages (sender, reciver, content, tick, sent_at) value (?, ?, ?, 1, ?)", [sender, reciver, content, sent_at])
            }
            const msg = await connection.execute("select * from messages where id = ?", [ data[0].insertId ])
            await connection.commit()
            return msg[0][0]
        } catch (error) {
            console.log("Error: here", error)
            await connection.rollback()
            throw new Error(error)
        } finally {
            connection.release()
        }
    }

    async #getNotDeliveredMsg(reciver) {
        const connection = await pool.getConnection()
        try {
            let [msgs, fields] = await connection.execute("select * from messages where reciver = ? and tick = 1", [reciver])
            await connection.execute("update messages set tick = 2, recived_at = now() where reciver = ? and tick = 1", [reciver])
            await connection.commit()
            return msgs != '' ? msgs : null
        } catch (error) {
            await connection.rollback()
            throw new Error(error)
        } finally {
            connection.release()
        }
    }

    // inform to sender that his / her messages delivered
    async #delevered(msg_id, sender, reciver) {
        // console.log(msg_id, sender, "oppp")
        if (msg_id, sender) {
            const senderSocketId = await userIdToSocketId(sender)
            if (senderSocketId.length > 0) {
            // console.log(senderSocketId)
                senderSocketId.forEach(socketId => io.to(socketId).emit("message:status", {msg_id, tick: 2, reciver, recived_at: new Date().toISOString()}))
            }
        }
    }

    async sendUndelivered(socketId, userID) {
        const undeliverdMessages = await this.#getNotDeliveredMsg(userID)
        // console.log(undeliverdMessages)
        if (undeliverdMessages) {
            io.to(socketId).emit("waited:messages", undeliverdMessages)
            undeliverdMessages.forEach(message => {
                this.#delevered(message?.id, message?.sender, message?.reciver)
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
const idToUser = new Map()
const userToId = new Map()
import pool from "../db/pool.js"

class Msg {
    constructor() {

    }
    async pushMessage({sender, reciver, content, tick = 1}) {
        try {
            if (tick == 1)
                await pool.execute("insert into messages (sender, reciver, content) value (?, ?, ?)", [sender, reciver, content])
            else if (tick == 2)
                await pool.execute("insert into messages (sender, reciver, content, tick, recived_at) value (?, ?, ?, 2, now())", [sender, reciver, content])
        } catch (error) {
            console.log("Error: here", error)
        }
    }
    async getNotDeliveredMsg(reciver) {
        try {
            const [msgs, fields] = await pool.execute("select sender, content, sent_at from messages where reciver = ? and tick = 1", [reciver])
            await pool.execute("update messages set tick = 2, recived_at = now() where reciver = ? and tick = 1", [reciver])
            return msgs != '' ? msgs : null
        } catch (error) {
            console.log("Error getAll:", error)
        }
    }
    async seen({sender, reciver}) {
        try {
            await pool.execute('update messages set tick = 3, seen_at = now() where sender = ? and reciver = ? and tick = 2', [sender, reciver])
        } catch (e) {
            console.log("Error : ", e)
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
export const Message = new Msg()

export const registerUser = (id, user) => {
    user = parseInt(user)
    idToUser.set(id, user)
    userToId.set(user, id)
}

export const disconnectUser = (id) => {
    const user = idToUser.get(id)
    userToId.delete(user)
    idToUser.delete(id)
}

export const getUserFromId = (id) => {
    return idToUser.get(id)
}

export const getIdFromUser = (user) => {
    return userToId.get(parseInt(user))
}

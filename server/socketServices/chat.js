const idToUser = new Map()
const userToId = new Map()
import pool from "../db/pool.js"

export class Message {
    constructor() {

    }
    async pushMessage({sender, reciver, content, tick = 1}) {
        try {
            await pool.execute("insert into message (sender, reciver, content) value (?, ?, ?)", [sender, reciver, content])
        } catch (error) {
            console.log("Error: here", error)
        }
    }
    async getAll(userId) {
        try {
            const [msgs, fields] = await pool.execute("select sender, content from message where reciver = ?", [userId])
            await pool.execute("delete from message_queue where msg_to = ?", [userId])
            return msgs != '' ? msgs : null
        } catch (error) {
            console.log("Error getAll:", error)
        }
    }
}

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

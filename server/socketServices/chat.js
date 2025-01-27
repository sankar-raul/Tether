const idToUser = new Map()
const userToId = new Map()

import Msg from "./utils/Message.js"

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

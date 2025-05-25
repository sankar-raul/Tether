import { createClient } from 'redis'
import { config } from 'dotenv'
import pool from '../db/pool.js'
import { io } from '../server.js'
config()

const REDIS_SERVER = process.env.REDIS_SERVER
const is_dev_mode = process.env.DEV_MODE == 'true'
// console.log(is_dev_mode, REDIS_SERVER)

export const pub = createClient({url: is_dev_mode ? 'redis://127.0.0.1:6379' : REDIS_SERVER})
export const sub = pub.duplicate()
export const redis = pub.duplicate()
const IS_DEV_MODE = process.env.DEV_MODE == 'true'

;(async () => {
    try {
        await Promise.all([pub.connect(), sub.connect(), redis.connect()])
        IS_DEV_MODE && await redis.flushAll()
        console.log("connected to redis")
    } catch (error) {
        console.log(error, '--> redis')
    }
})()

redis.on('error', async (error) => {
    console.log("Error in redis ->", error)
    await redis.connect()
})

export const connectUser = async ({user_id, socket_id, socket} = {}) => {
    await Promise.all([
        redis.sAdd(`user_id:${user_id}`, socket_id),
        redis.set(`socket_id:${socket_id}`, user_id),
        setUserStatus({user_id, isOnline: true})
    ])
    const contacts = await getFriendList(user_id)
    // console.log(contacts)
    contacts.forEach(contact_id => socket.join(`user_online_status:${contact_id}`))
    // console.log(await redis.sMembers(`user_id:${user_id}`))
}

export const disconnectUser = async ({ socket_id, socket}) => {
    const user_id = await redis.get(`socket_id:${socket_id}`)
    if (user_id) {
        const [ remaining ] = await Promise.all([
            redis.sCard(`user_id:${user_id}`),
            redis.sRem(`user_id:${user_id}`, socket_id),
            redis.del(`socket_id:${socket_id}`),
        ])
        if (remaining <= 1) {
            await Promise.all([redis.del(`user_id:${user_id}`), setUserStatus({user_id, isOnline: false})])
        }
    }
}

export const userIdToSocketId = async (user_id) => {
    return await redis.sMembers(`user_id:${user_id}`)
}

export const socketIdToUserId = async (socket_id) => {
    return await redis.get(`socket_id:${socket_id}`)
}

export const setUserStatus = async ({user_id, isOnline = true, isTyping = false} = {}) => { // status -> online | offline
    if (!user_id) throw new Error('user_id required -> setUserStatus')
    const payload = JSON.stringify({
        user_id,
        isOnline,
        isTyping,
        timestamp: Date.now()
    })
    await pub.publish('user_status', payload)
    redis.set(`user_status:${user_id}`, JSON.stringify({isOnline, isTyping}))
    if (!isOnline)
        await redis.del(`user_status:${user_id}`)
    else 
        await redis.set(`user_status:${user_id}`, payload)

}

export const getUserStatus = async ( user_id ) => {
    if (!user_id) {
        console.log("user_id required -> getUserStatus()")
        return
    }
        const payload = await redis.get(`user_status:${user_id}`)
        // console.log(payload)
        if (payload) {
            return JSON.parse(payload)
        } else {
            return { isOnline: false, isTyping: false }
        }

}
export const getUserFriendsFromDb = async ( user_id ) => {
    let [ friends ] = await pool.execute('call getContacts(?)', [user_id])
    // console.log(contacts[0])
    const contacts = []
    friends = friends?.[0] || []
    for (const friend of friends) {
        const userStatus = await getUserStatus(friend.contact_id)
        friend.isOnline = userStatus?.isOnline
        friend.isTyping = userStatus?.isTyping
        contacts.push(friend)
        await redis.hSet(`friend_list:${user_id}`, friend.contact_id, JSON.stringify(friend))
    }
    await redis.expire(`friend_list:${user_id}`, 3600) // 1 hour
    return contacts

}
export const getFriendList = async ( user_id, { details } = {} ) => {
    if (!user_id) throw new Error('user_name required -> getUserFriends')
    try {
        const isCached = await redis.exists(`friend_list:${user_id}`)
        if (!isCached) {
            await getUserFriendsFromDb(user_id)
        }
        let friendList = await redis.hGetAll(`friend_list:${user_id}`)
        return details ? friendList : Object.keys(friendList)
    } catch (error) {
        console.log(error, '-> getFriendList()')
    }
}

// subscribers
sub.subscribe('user_status', async (message) => {
    const payload = JSON.parse(message)
    io.to(`user_online_status:${payload.user_id}`).emit('contact_status', payload) // payload -> { isOnline->bool, user_id, isTyping:bool }
})
// do online offline functions -- TODO
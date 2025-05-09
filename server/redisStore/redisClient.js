import { createClient } from 'redis'
import { config } from 'dotenv'
import pool from '../db/pool.js'
import { io } from '../server.js'
config()

const REDIS_SERVER = process.env.REDIS_SERVER
const is_dev_mode = process.env.DEV_MODE == 'true'
console.log(is_dev_mode, REDIS_SERVER)

export const pub = createClient(!is_dev_mode ? {url: REDIS_SERVER} : '')
export const sub = pub.duplicate()
export const redis = pub.duplicate()
const IS_DEV_MODE = process.env.DEV_MODE == 'true'

;(async () => {
    try {
        await Promise.all([pub.connect(), sub.connect(), redis.connect()])
        IS_DEV_MODE && await redis.flushAll()
        console.log("connected to redis")
    } catch (error) {
        console.log(error)
    }
})()

redis.on('error', (error) => {
    console.log("Error in redis ->", error)
})

export const connectUser = async ({user_id, socket_id} = {}) => {
    await Promise.all([
        redis.sAdd(`user_id:${user_id}`, socket_id),
        redis.set(`socket_id:${socket_id}`, user_id),
        setUserStatus(user_id, "online")
    ])
    // console.log(await redis.sMembers(`user_id:${user_id}`))
}

export const disconnectUser = async (socket_id) => {
    const user_id = await redis.get(`socket_id:${socket_id}`)
    if (user_id) {
        const [ remaining ] = await Promise.all([
            redis.sCard(`user_id:${user_id}`),
            redis.sRem(`user_id:${user_id}`, socket_id),
            redis.del(`socket_id:${socket_id}`),
        ])
        if (remaining <= 1) {
            await Promise.all([redis.del(`user_id:${user_id}`), setUserStatus(user_id, 'offline')])
        }
    }
}

export const userIdToSocketId = async (user_id) => {
    return await redis.sMembers(`user_id:${user_id}`)
}

export const socketIdToUserId = async (socket_id) => {
    return await redis.get(`socket_id:${socket_id}`)
}

export const setUserStatus = async (user_id, status = 'online') => { // status -> online | offline
    if (!user_id) throw new Error('user_id required -> setUserStatus')
    console.log(user_id, status)
    const payload = JSON.stringify({
        user_id,
        status,
        timestamp: Date.now()
    })
    await pub.publish('user_status', payload)
    if (status == 'offline')
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
        if (payload) {
            return JSON.parse(payload)?.status
        } else {
            return "offline"
        }
}
export const getUserFriendsFromDb = async ( user_id ) => {
    let [ friends ] = await pool.execute('call getContacts(?)', [user_id])
    // console.log(contacts[0])
    const contacts = []
    friends = friends?.[0] || []
    for (const friend of friends) {
        const userStatus = await getUserStatus(friend.contact_id)
        friend.status = userStatus
        contacts.push(friend)
        await redis.hSet(`friend_list:${user_id}`, friend.contact_id, JSON.stringify(friend))
    }
    await redis.expire(`friend_list:${user_id}`, 3600) // 1 hour
    return contacts

}
export const getFriendList = async ( user_id ) => {
    if (!user_id) throw new Error('user_name required -> getUserFriends')
    try {
        const isCached = await redis.exists(`friend_list:${user_id}`)
        if (!isCached) {
            await getUserFriendsFromDb(user_id)
        }
        let friendList = await redis.hGetAll(`friend_list:${user_id}`)
        return Object.keys(friendList)
    } catch (error) {
        console.log(error, '-> getFriendList()')
    }
}

export const trigerStatusChanged = async (user_id, statusUpdateCallback) => {
    if (!user_id || !statusUpdateCallback) throw new Error("user_id and callback is required -> trigerStatusChanged")
    const friends = await getFriendList(user_id, {details: false})
    friends.forEach(async friend_id => {
        const friend_socket_id = await userIdToSocketId(friend_id)
        friend_socket_id.length > 0 && friend_socket_id.forEach(f => statusUpdateCallback(f))
    });
}

// subscribers
sub.subscribe('user_status', async (message) => {
    const payload = JSON.parse(message)
    // console.log(payload)
    await trigerStatusChanged(payload.user_id, (friend_socket_id) => {
        if (!friend_socket_id) return
        io.to(friend_socket_id).emit('friend_online_status', payload)
        return
    })
})
// do online offline functions -- TODO
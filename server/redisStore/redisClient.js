import { createClient } from 'redis'
import { config } from 'dotenv'
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

export const connectUser = async ({user_id, socket_id} = {}) => {
    await redis.sAdd(`user_id:${user_id}`, socket_id)
    await redis.set(`socket_id:${socket_id}`, user_id)
    console.log(await redis.sMembers(`user_id:${user_id}`))
}

export const disconnectUser = async (socket_id) => {
    const user_id = await redis.get(`socket_id:${socket_id}`)
    if (user_id) {
        await redis.del(`socket_id:${socket_id}`)
        await redis.sRem(`user_id:${user_id}`, socket_id)
        const remaining = await redis.sCard(`user_id:${user_id}`)
        if (remaining == 0) {
            await redis.del(`user_id:${user_id}`)
        }
    }
}

export const userIdToSocketId = async (user_id) => {
    return await redis.sMembers(`user_id:${user_id}`)
}

export const socketIdToUserId = async (socket_id) => {
    return await redis.get(`socket_id:${socket_id}`)
}

// do online offline functions -- TODO
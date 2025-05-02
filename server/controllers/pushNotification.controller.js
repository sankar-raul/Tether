import web_push from "../service/pushConfig.js"
import { config } from "dotenv"
import pool from '../db/pool.js'

config()


export const subscribeNotification = async (req, res) => {
    const { id } = req.user
    
    if (!id) return res.status(401).json({success: false, msg: 'access denied!'})
    if (!req.subscription || !req.subscription.keys) return res.status(401).json({success: false, msg: 'invalid subscription payload!'})
    const {endpoint, keys: {p256dh, auth}} = req.subscription

    try {
        const sql = "update into notification_subscription (user_id, endpoint, p256dh, auth) values(?, ?, ?, ?)"
        const info = await pool.execute(sql, [id, endpoint, p256dh, auth])
        console.log(info)
        return res.status(201).json({success: true, msg: 'subscribed'})
    } catch (error) {
        console.log(error)
        return res.status(500).json({success: false, msg: 'internal server error!'})
    }
}

export const unSubscribeNotification = (req, res) => {
    return res.status(201).json({success: true, msg: 'unsubscribed'})
}
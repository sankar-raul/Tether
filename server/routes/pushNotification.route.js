import express from 'express'
import { subscribeNotification, unSubscribeNotification } from '../controllers/pushNotification.controller.js'
const NotificationRoute = express.Router()

NotificationRoute.post('/subscribe', subscribeNotification)
NotificationRoute.post('/unsubscribe', unSubscribeNotification)
NotificationRoute.use((req, res) => {
    res.end('lol')
})
export default NotificationRoute
import messageSent from '../assets/sound/message_sent.wav'
import messageRecive from '../assets/sound/message_recived.wav'
class NotiPlayer {
    constructor() {
        this.Sent = new Audio(messageSent)
        this.Recive = new Audio(messageRecive)
        this.Sent.load()
        this.Recive.load()
    }
    sent() {
        this.Sent.currentTime = .1
        this.Sent.play()
    }
    recive() {
        this.Recive.currentTime = 0
        this.Recive.play()
    }

}
const NotifyTone = new NotiPlayer()
export default NotifyTone
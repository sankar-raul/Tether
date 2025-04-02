import { Message } from "../socketServices/chat.js"

export const getAllMessage = async (req, res) => {
    const messages = await Message.getAll(req.user.id)
    res.status(200).json(messages || {})
}
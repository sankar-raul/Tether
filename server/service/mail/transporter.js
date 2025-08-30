import { config } from "dotenv"
import { createTransport } from "nodemailer"

config({
    path: '../../.env'
})

export const mailUser = process.env.MAIL_USER
const password = process.env.MAIL_PASS

const transporter = createTransport({
    service: 'gmail',
    auth: {
        user: mailUser,
        pass: password
    }
})
export default transporter
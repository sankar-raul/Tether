import { config } from "dotenv"
import { createTransport } from "nodemailer"

config({
    path: '../../.env'
})

const { MAIL_USER, MAIL_PASS, MAIL_HOST, MAIL_PORT } = process.env
export const mailUser = MAIL_USER

const transporter = createTransport({
    host: MAIL_HOST,
    port: MAIL_PORT,
    secure: true,
    auth: {
        user: MAIL_USER,
        pass: MAIL_PASS
    }
})
export default transporter
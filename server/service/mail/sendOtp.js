import transporter, { mailUser } from "./transporter.js"

export default async function sendOtp({
    to, subject = "Default Subject", ...args
}) {
    const config = {
        from: `"Tether - Stay Connected" <raulsankar99@gmail.com>`,
        to,
        subject,
        ...args
    }
    try {
        const info = await transporter.sendMail(config)
        // console.log(info.response)
    } catch (error) {
        console.log(error)
    }
}
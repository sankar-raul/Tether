import bcryptjs from 'bcryptjs'
import { config } from 'dotenv'
config()

const rounds = process.env.ENCRYPTION_SALT_ROUND

export const hash = async (str) => {
    if (!str) return null
    const salt = await bcryptjs.genSalt(parseInt(rounds))
    return await bcryptjs.hash(str, salt)
}
export const varify = async (str, hash) => {
    if (!hash || !str) return null
    return await bcryptjs.compare(str, hash)
}

export default {
    hash,
    varify
}
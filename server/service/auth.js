import jwt from 'jsonwebtoken'
import { config } from 'dotenv'
const secret = process.env.JWT_SECRET
config()

export const setUser = (user) => {
    if (!user) return null
    const payload = {
        ...user
    }
    return jwt.sign(payload, secret)
}

export const getUser = (token) => {
    if (!token) return null
    try {
        return jwt.verify(token, secret)
    } catch (error) {
        return null
    }
}
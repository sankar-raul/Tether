import crypto from 'crypto'
import pool from '../db/pool.js'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { config } from 'dotenv'
config()

const JWT_SECRET = process.env.ACCESS_TOKEN_JWT_SECRET
const ACCESS_TOKEN_EXPIRES = '15m'
const REFRESH_TOKEN_EXPIRES_DAY = 7 // days

class Access_Token {
    constructor() {

    }
    issue(user_id) { // issue new access token
        if (!user_id) throw new Error('user_id required 🐞')
        const newAccessToken = jwt.sign({id: user_id}, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES })
        return newAccessToken
    }
    get(access_token) { // decrypt and return the object
        const payload = jwt.verify(access_token, JWT_SECRET)
        return payload
    }
}
export const AccessToken = new Access_Token()

class Refresh_Token {
    constructor() {
    
    }
    async issue(user_id) { // issue new access token for the user
        if (!user_id) throw new Error('user_id required 🐞')
        try {
            const newRefreshToken = uuidv4()
            const encryptedToken = crypto.createHash('sha256').update(newRefreshToken).digest('hex') // 💪
            await pool.execute('call new_refresh_token(?, ?, ?)', [encryptedToken, user_id, REFRESH_TOKEN_EXPIRES_DAY])
            return [ newRefreshToken, AccessToken.issue(user_id) ] // return 
        } catch (error) {
            throw new Error(error)
        }
    }
    async refresh(token) { // refresh the token and return new token
        if (!token) return null
        try {
            const tokenInfo = await this.get(token)
            if ( !tokenInfo || new Date(tokenInfo.expires_at).getTime() < Date.now() ) return 'invalid token'
            const [[new_refresh_token, access_token], ] = await Promise.all([this.issue(tokenInfo.user_id), this.delete(token)])
            return [ new_refresh_token, access_token ]
        } catch (error) {
            throw new Error(error)
        }
    }
    async delete(refresh_token) { // delete the old refresh token
        if (!refresh_token) throw new Error('refresh token required in delete method')
        const encryptedToken = crypto.createHash('sha256').update(refresh_token).digest('hex') // 💪
        await pool.execute('call delete_refresh_token(?)', [encryptedToken])
        console.log("delete refresh token", refresh_token)
        return
    }
    async get(refresh_token) { // retrive and return the data about that refresh token holder
        if (!refresh_token) throw new Error('refresh_token required')
        const encryptedToken = crypto.createHash('sha256').update(refresh_token).digest('hex')
        
        try {
            const [ rows, ] = await pool.execute('call get_refresh_token_info(?)', [encryptedToken])
            return rows?.[0]?.[0]
        } catch (error) {
            throw new Error(error)
        }
    }
}
export const RefreshToken =  new Refresh_Token()
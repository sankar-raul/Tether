import pool from "../db/pool.js"
// import { setUser } from "../service/auth.js"
import { hash, varify } from '../service/crypt.js'
import { AccessToken, RefreshToken } from "../service/authToken.js"
import { config } from "dotenv"
import { redis } from '../redisStore/redisClient.js'
import OTP from '../service/generateOtp.js'
import crypto from 'crypto'
config()

const isDevMode = process.env.DEV_MODE == 'true'
const ACCESS_TOKEN_EXPIRES_MS = 15 * 60 * 1000 // 15 minutes
const REFRESH_TOKEN_EXPIRES_MS = 7 * 24 * 3600 * 1000 // 7 days
export const start_registration = async (req, res) => {
    const { email, username, password, fullname } = req.body // destructure email, username, password from request body
    if (!email || !username || !password || !fullname) // check if all required credintials are ok
        return res.status(400).json({success: false, msg: "email & username & password required!"})
    try {
    const [ check_email, check_username ] = await Promise.all([pool.execute("select email from users where email = ?", [email]), pool.execute('select username from users where username = ?', [username])])
    const errors = {
        email: check_email[0] != '',
        username: check_username[0] != ''
    }
    // console.log(errors, check_username[0])
    if (errors.email || errors.username) { // check is user with same email is exists or username is allready taken
        const messages = []
        errors.email && messages.push({ field: "email", msg: "Email already registered with different account" })
        errors.username && messages.push({ field: "username", msg: "Username all ready taken" })
        return res.status(400).json({success: false, messages})
    }
    const hashedPassword = await hash(password)
    const [hashedOtp, otp] = OTP.generateOtp(6)
    console.log("OTP sent!", otp)
    const otp_token = crypto.createHash('sha256').update(crypto.randomUUID()).digest('hex') // 🔒
    // store the user info to redis
    await redis.set(`otp:${otp_token}`, hashedOtp, 'EX', 300) // 5 minutes
    await redis.set(`signup:${otp_token}`, JSON.stringify({
        email,
        username,
        fullname,
        hashedPassword
    }), 'EX', 600) // 10 minutes
    // const [ data ] = await pool.execute("insert into users (email, username, password) value (?, ?, ?)", [email, username, hashedPassword])
    // const [ refresh_token, access_token ] = await RefreshToken.issue(data.insertId)

    // res.cookie('refresh_token', refresh_token, {
    //     sameSite: 'None',
    //     path: '/',
    //     secure: true,
    //     maxAge: REFRESH_TOKEN_EXPIRES_MS
    // })
    // res.cookie("access_token", access_token, {
    //     sameSite: 'None',
    //     path: '/',
    //     secure: true,
    //     maxAge: ACCESS_TOKEN_EXPIRES_MS
    // })
    // return res.status(201).json({success: true, msg: "success", auth_credentials: { access_token, refresh_token }})
    return res.status(201).json({success: true, msg: "success", otp_token})
} catch (error) {
    console.log("Error:", error)
    return res.status(500).json({success: false, msg: "internal server error!"})
}
}

export const varifyOtp = async (req, res) => {
    const otp_token = req.params?.otp_token
    const { otp } = req.body
    // console.log(otp, otp_token)
    if (!otp_token || !otp) {
        return res.json({
            success: false,
            msg: "otp required"
        })
    }
    const connection = await pool.getConnection()
    try {
        const hashedOtp = await redis.get(`otp:${otp_token}`)
        console.log(hashedOtp, otp)
        if (!hashedOtp) {
            return res.json({success: false, msg: "otp expired!"})
        }
        const isValid = OTP.verify(otp, hashedOtp)
        if (isValid) {
            console.log("otp varification success!")
            let userInfo = await redis.get(`signup:${otp_token}`)
            userInfo = JSON.parse(userInfo)
            const { email, username, hashedPassword, fullname } = userInfo
            const [ data ] = await connection.execute("insert into users (email, username, password, fullname) value (?, ?, ?, ?)", [email, username, hashedPassword, fullname])
            const [ refresh_token, access_token ] = await RefreshToken.issue(data.insertId)
            console.log(data)
            await redis.del(`otp:${otp_token}`)
            await redis.del(`signup:${otp_token}`)
            await connection.commit()
            return res.status(201).json({success: true, msg: "success", auth_credentials: { access_token, refresh_token }})
        } else {
            return res.json({
                success: false,
                msg: "invalid otp"
            })
        }
    } catch (error) {
        console.log(error)
        await connection.rollback()
        return res.status(500).json({success: false, msg: "Internal Server Error"})
    } finally {
        connection.destroy()
    }
}
export const resendOtp = async (req, res) => {
    const otp_token = req.paramas?.otp_token
    if (!otp_token) {
        return res.json({
            success: false,
            msg: "invalid request"
        })
    }
    try {
    const isUserInfoExists = await redis.exists(`signup:${otp_token}`)
    if (isUserInfoExists) {
        const [newHashedOtp, otp] = OTP.generateOtp(6)
        console.log("OTP sent!", otp)
        await redis.set(`otp:${otp_token}`, newHashedOtp)
        return res.json({success: true, otp_token: otp_token})
    } else {
        return res.json({success: false, msg: "session_expired"})
    }
} catch (error) {
    console.log(error, "Error in ----->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> resendOtp() controller")
    return res.status(500).json({success: false, msg: "Internal Server Error"})
}
}
export const login = async (req, res) => {
    const { email, password } = req.body // destructure email, password from request body
    // console.log(req.body)
    if (!email || !password)
        return res.status(400).json({success: false, msg: "email & password required!"})
    try {
        const [ tuples, ] = await pool.execute("select id, password, username from users where email = ? limit 1", [email])
        if (tuples == '')
            return res.status(401).json({success: false, msg: "user not found!"})
        const isAuthenticated = await varify(password, tuples[0].password)
        if (isAuthenticated) {
            const [ refresh_token, access_token ] = await RefreshToken.issue(tuples[0].id)
            // res.cookie('refresh_token', refresh_token, {
            //     sameSite: 'None',
            //     path: '/',
            //     secure: true,
            //     maxAge: REFRESH_TOKEN_EXPIRES_MS
            // })
            // res.cookie("access_token", access_token, {
            //     sameSite: 'None',
            //     path: '/',
            //     secure: true,
            //     maxAge: ACCESS_TOKEN_EXPIRES_MS
            // })
            return res.status(200).json({success: true, msg: "logged in", data: {id: tuples[0].id, username: tuples[0].username}, auth_credentials: { refresh_token, access_token }})
        } else {
            return res.status(401).json({success: false, msg: "incorrect password!"})
        }
    } catch (error) {
        console.log("Error: 🐞how in auth.js", error)
        res.status(500).json({success: false, msg: "internal server error"})
    }
}
export const logout = async (req, res) => {
    const { refresh_token } = req.body
    if (refresh_token)
        await RefreshToken.delete(refresh_token)
    else
        return res.status(401).json({success: false, msg: 'access denied'})
    // res.clearCookie('refresh_token', { path: '/', sameSite: 'None', secure: true})
    // res.clearCookie('access_token', { path: '/', sameSite: 'None', secure: true})
    res.status(200).json({success: true, msg: 'logout success'})
}

export const update = async (req, res) => {
    const what = req.params.what
    const { password, changeTo } = req.body
    const { id } = req.user
    const validUpdates = {
        password: true,
        username: true
    }
    if (!validUpdates[what] || !id || !password || !changeTo)
        return res.status(400).json({success: false, msg: "invalid request!"})
    try {
        const data = await pool.execute(`update users set ${what} = ? where id = ? and password = ?`, [changeTo, id, password])
        if (data[0].affectedRows == 1) {
            return res.status(201).json({success: true, msg: "updated!"})
        } else {
            return res.status(401).json({success: false, msg: "incorrect password!"})
        }
    } catch (error) {
        console.log("Error:", error)
        res.status(500).json({success: false, msg: "internal server error"})
    }
}

export const deleteUser = async (req, res) => {
    const { password } = req.body // destructure password from request body
    const { id } = req.user
    if (!id || !password)
        return res.status(400).json({success: false, msg: "invalid request!"})
    try {
        const data = await pool.execute("delete from users where id = ? and password = ?", [id, password])
        if (data[0].affectedRows == 1) {
            // res.clearCookie('refresh_token', { path: '/', sameSite: 'None', secure: true})
            // res.clearCookie('access_token', { path: '/', sameSite: 'None', secure: true})
            return res.status(200).json({success: true, msg: "account deleted!"})
        }
        else
            return res.status(401).json({success: false, msg: "incorrect password!"})
    } catch (error) {
        console.log("Error:", error)
        res.status(500).json({success: false, msg: "internal server error"})
    }
}

export const refreshToken = async (req, res) => {
    // 💪💪💪💪💪💪😎
    try {
        const { refresh_token: old_refresh_token } = req.body
        
        if (!old_refresh_token) return res.status(401).json({ success: false, msg: 'no auth' })
        const tokens = await RefreshToken.refresh(old_refresh_token)
        if (tokens == 'invalid token') {
            // res.clearCookie('refresh_token', { path: '/', sameSite: 'None', secure: true})
            // res.clearCookie('access_token', { path: '/', sameSite: 'None', secure: true})
            return res.status(401).json({ success: false, msg: 'no auth' }) // access denied!
        }
        if (tokens) {
            const [ refresh_token, access_token ] = tokens

            // res.cookie('refresh_token', refresh_token, {
            //     sameSite: 'None',
            //     path: '/',
            //     secure: true,
            //     maxAge: REFRESH_TOKEN_EXPIRES_MS
            // })
            // res.cookie("access_token", access_token, {
            //     sameSite: 'None',
            //     path: '/',
            //     secure: true,
            //     maxAge: ACCESS_TOKEN_EXPIRES_MS
            // })
            return res.status(200).json({success: true, msg: 'refreshed', access_token, refresh_token}) // success
        }
        return res.end('📍')
    } catch (error) {
        console.log(error, "Error in refreshToken() endpoint")
        return res.status(500).json({success: false, msg: 'internal server error'}) // internal server error
    }
}
import pool from "../db/pool.js"
// import { setUser } from "../service/auth.js"
import { hash, varify } from '../service/crypt.js'
import { AccessToken, RefreshToken } from "../service/authToken.js"
import { config } from "dotenv"
config()

const isDevMode = process.env.DEV_MODE == 'true'
const ACCESS_TOKEN_EXPIRES_MS = 15 * 60 * 1000 // 15 minutes
const REFRESH_TOKEN_EXPIRES_MS = 7 * 24 * 3600 * 1000 // 7 days
export const register = async (req, res) => {
    const { email, username, password } = req.body // destructure email, username, password from request body
    if (!email || !username || !password) // check if all required credintials are ok
        return res.status(400).json({success: false, msg: "email & username & password required!"})
    try {
    const user = await pool.execute("select email from users where email = ?", [email])
    if (user[0] != '') { // check is user with same email is exists
        return res.status(405).json({success: false, msg: "user already exists"})
    }
    const hashedPassword = await hash(password)
    const [ data ] = await pool.execute("insert into users (email, username, password) value (?, ?, ?)", [email, username, hashedPassword])
    const [ refresh_token, access_token ] = await RefreshToken.issue(data.insertId)

    res.cookie('refresh_token', refresh_token, {
        sameSite: 'None',
        path: '/',
        secure: true,
        maxAge: REFRESH_TOKEN_EXPIRES_MS
    })
    res.cookie("access_token", access_token, {
        sameSite: 'None',
        path: '/',
        secure: true,
        maxAge: ACCESS_TOKEN_EXPIRES_MS
    })
    return res.status(201).json({success: true, msg: "success"})
} catch (error) {
    console.log("Error:", error)
    return res.status(500).json({success: false, msg: "internal server error!"})
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
            res.cookie('refresh_token', refresh_token, {
                sameSite: 'None',
                path: '/',
                secure: true,
                maxAge: REFRESH_TOKEN_EXPIRES_MS
            })
            res.cookie("access_token", access_token, {
                sameSite: 'None',
                path: '/',
                secure: true,
                maxAge: ACCESS_TOKEN_EXPIRES_MS
            })
            return res.status(200).json({success: true, msg: "logged in", data: {id: tuples[0].id, username: tuples[0].username}})
        } else {
            return res.status(401).json({success: false, msg: "incorrect password!"})
        }
    } catch (error) {
        console.log("Error: 🐞how in auth.js", error)
        res.status(500).json({success: false, msg: "internal server error"})
    }
}
export const logout = async (req, res) => {
    const { refresh_token } = req.cookies
    if (refresh_token)
        await RefreshToken.delete(refresh_token)
    else
        return res.status(401).json({success: false, msg: 'access denied'})
    res.clearCookie('refresh_token', { path: '/', sameSite: 'None', secure: true})
    res.clearCookie('access_token', { path: '/', sameSite: 'None', secure: true})
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
            res.clearCookie('refresh_token', { path: '/', sameSite: 'None', secure: true})
            res.clearCookie('access_token', { path: '/', sameSite: 'None', secure: true})
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
        const { refresh_token: old_refresh_token } = req.cookies
        if (!old_refresh_token) return res.status(401).json({ success: false, msg: 'no auth' })
        const tokens = await RefreshToken.refresh(old_refresh_token)
        if (tokens == 'invalid token') {
            res.clearCookie('refresh_token', { path: '/', sameSite: 'None', secure: true})
            res.clearCookie('access_token', { path: '/', sameSite: 'None', secure: true})
            return res.status(401).json({ success: false, msg: 'no auth' }) // access denied!
        }
        if (tokens) {
            const [ refresh_token, access_token ] = tokens

            res.cookie('refresh_token', refresh_token, {
                sameSite: 'None',
                path: '/',
                secure: true,
                maxAge: REFRESH_TOKEN_EXPIRES_MS
            })
            res.cookie("access_token", access_token, {
                sameSite: 'None',
                path: '/',
                secure: true,
                maxAge: ACCESS_TOKEN_EXPIRES_MS
            })
            return res.status(200).json({success: true, msg: 'refreshed', access_token: access_token}) // success
        }
        return res.end('📍')
    } catch (error) {
        console.log(error, "Error in refreshToken() endpoint")
        return res.status(500).json({success: false, msg: 'internal server error'}) // internal server error
    }
}
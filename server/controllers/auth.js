import pool from "../db/pool.js"
import { setUser } from "../service/auth.js"
import { hash, varify } from '../service/crypt.js'

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
    const data = await pool.execute("insert into users (email, username, password) value (?, ?, ?)", [email, username, hashedPassword])
    const token = setUser({
        id: data[0].insertId,
        email,
        username
    })
    res.cookie("secret", token, {
        sameSite: 'None',
        path: '/',
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })
    res.status(201).json({success: true, msg: "success", data: {id: data[0].insertId}})
} catch (error) {
    console.log("Error:", error)
    res.status(500).json({success: false, msg: "internal server error!"})
}
}

export const login = async (req, res) => {
    const { email, password } = req.body // destructure email, password from request body
    if (!email || !password)
        return res.status(400).json({success: false, msg: "email & password required!"})
    try {
        const [ tuples, fields ] = await pool.execute("select id, password, username from users where email = ? limit 1", [email])
        if (tuples == '')
            return res.status(401).json({success: false, msg: "user not found!"})
        const isAuthenticated = await varify(password, tuples[0].password)
        if (isAuthenticated) {
            const token = setUser({
                id: tuples[0].id,
                email,
                username: tuples[0].username,
            })
            res.cookie("secret", token, {
                sameSite: 'None',
                path: '/',
                secure: true,
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            })
            return res.status(200).json({success: true, msg: "logged in", data: {id: tuples[0].id}})
        } else {
            return res.status(401).json({success: false, msg: "incorrect password!"})
        }
    } catch (error) {
        console.log("Error: hre", error)
        res.status(500).json({success: false, msg: "internal server error"})
    }
}
export const logout = (req, res) => {
    res.clearCookie('secret', { path: '/' })
    res.status(200).json({success: true})
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
            res.clearCookie('secret')
            return res.status(200).json({success: true, msg: "account deleted!"})
        }
        else
            return res.status(401).json({success: false, msg: "incorrect password!"})
    } catch (error) {
        console.log("Error:", error)
        res.status(500).json({success: false, msg: "internal server error"})
    }
}
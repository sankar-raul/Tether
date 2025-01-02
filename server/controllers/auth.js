import pool from "../db/pool.js"
import { setUser } from "../service/auth.js"

export const register = async (req, res) => {
    const { email, username, password } = req.body // destructure email, username, password from request body
    if (!email || !username || !password) // check if all required credintials are ok
        return res.status(400).json({success: false, msg: "email & username & password required!"})
    try {
    const user = await pool.execute("select email from users where email = ?", [email])
    if (user[0] != '') { // check is user with same email is exists
        return res.status(405).json({success: false, msg: "user already exists"})
    }
    const data = await pool.execute("insert into users (email, username, password) value (?, ?, ?)", [email, username, password])
    const token = setUser({
        id: data[0].insertId,
        email,
        username
    })
    res.cookie("secret", token)
    res.status(201).json({success: true, msg: "success", data: {id: data[0].insertId}})
} catch (error) {
    console.log("Error:", error)
    res.status(500).json({success: false, msg: "internal server error"})
}
}

export const login = async (req, res) => {
    const { email, password } = req.body // destructure email, password from request body
    if (!email || !password)
        return res.status(400).json({success: false, msg: "email & password required!"})
    try {
        const data = await pool.execute("select id, password, username from users where email = ?", [email])
        if (data[0] == '')
            return res.status(401).json({success: false, msg: "user not found!"})
        const isAuthenticated = data[0][0].password == password
        if (isAuthenticated) {
            const token = setUser({
                id: data[0][0].id,
                email,
                username: data[0][0].username
            })
            res.cookie("secret", token)
            return res.status(200).json({success: true, msg: "logged in", data: {id: data[0][0].id}})
        } else {
            return res.status(401).json({success: false, msg: "incorrent password!"})
        }
    } catch (error) {
        console.log("Error:", error)
        res.status(500).json({success: false, msg: "internal server error"})
    }
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
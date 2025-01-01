import { Router } from "express"
import db from "../../db/connection.js"
const auth = Router()


// endpoint to register new user -> POST auth/register
auth.post('/register', async (req, res) => {
    const { email, username, password } = req.body // destructure email, username, password from request body
    if (!email || !username || !password) // check if all required credintials are ok
        return res.status(400).json({success: false, msg: "email & username & password required!"})
    try {
    const user = await (await db).query("select email from users where email = ?", [email])
    if (user[0] != '') { // check is user with same email is exists
        return res.status(405).json({success: false, msg: "user already exists"})
    }
    const data = await (await db).query("insert into users (email, username, password) value (?, ?, ?)", [email, username, password])
    res.status(201).json({success: true, msg: "success", data: {id: data[0].insertId}})
} catch (error) {
    console.log("Error:", error)
    res.status(500).json({success: false, msg: "internal server error"})
}
})

// endpoint to login user -> POST /auth/login
auth.post('/login', async (req, res) => {
    const { email, password } = req.body // destructure email, password from request body
    if (!email || !password)
        return res.status(400).json({success: false, msg: "email & password required!"})
    try {
        const data = await (await db).query("select id, password from users where email = ?", [email])
        if (data[0] == '')
            return res.status(401).json({success: false, msg: "user not found!"})
        const isAuthenticated = data[0][0].password == password
        if (isAuthenticated) {
            return res.status(200).json({success: true, msg: "logged in", data: {id: data[0][0].id}})
        } else {
            return res.status(401).json({success: false, msg: "incorrent password!"})
        }
    } catch (error) {
        console.log("Error:", error)
        res.status(500).json({success: false, msg: "internal server error"})
    }
})

// endpoint to update password | username -> PUT /auth/update/:what -> ( password | username )
auth.put('/update/:what', async (req, res) => {
    const what = req.params.what
    const { id, password, changeTo } = req.body
    const validUpdates = {
        password: true,
        username: true
    }
    if (!validUpdates[what] || !id || !password || !changeTo)
        return res.status(400).json({success: false, msg: "invalid request!"})
    try {
        const data = await (await db).query(`update users set ${what} = ? where id = ? and password = ?`, [changeTo, id, password])
        if (data[0].affectedRows == 1) {
            return res.status(201).json({success: true, msg: "updated!"})
        } else {
            return res.status(401).json({success: false, msg: "invalid cradintials!"})
        }
    } catch (error) {
        console.log("Error:", error)
        res.status(500).json({success: false, msg: "internal server error"})
    }
})

auth.put('/forgot', (req, res) => {
    res.end("ok")
})

// api endpoint to delete user -> DELETE /auth/delete
auth.delete('/delete', async (req, res) => {
    const { id, password } = req.body // destructure id, password from request body
    if (!id || !password)
        return res.status(400).json({success: false, msg: "invalid request!"})
    try {
        const data = await (await db).query("delete from users where id = ? and password = ?", [id, password])
        if (data[0].affectedRows == 1)
            return res.status(200).json({success: true, msg: "account deleted!"})
        else
            return res.status(401).json({success: false, msg: "Invalid cradintials!"})
    } catch (error) {
        console.log("Error:", error)
        res.status(500).json({success: false, msg: "internal server error"})
    }
})

auth.use((req, res) => {
    res.status(404).json({success: false, msg: "invalid endpoint!"})
})

export default auth
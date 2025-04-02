import express from 'express'
import pool from '../db/pool.js'
const root = express.Router()

root.get('/', async (req, res) => {
    const user = req.user
    if (user) {
        const [ users, columns ] = await pool.execute("select username, id from users where id <> ? order by username", [user.id])
        return res.render('home', { username: user.username, users })
    } else {
        return res.redirect('login')
    }
})

root.get('/register', (req, res) => {
    if (req.user) return res.redirect('/')
    return res.render('register')
})

root.get('/login', (req, res) => {
    if (req.user) return res.redirect('/')
    return res.render('login')
})

root.get('/logout', (req, res) => {
    if (!req.user) return res.redirect('/login')
    res.clearCookie('secret')
    return res.redirect('/login')
})

export default root
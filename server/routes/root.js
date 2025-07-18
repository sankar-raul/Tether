import express from 'express'
import pool from '../db/pool.js'
const root = express.Router()

root.get('/', async (req, res) => {
    const user = req.user
    return res.json({"message": `Hello user`})
})

// root.get('/register', (req, res) => {
//     if (req.user) return res.redirect('/')
//     return res.render('register')
// })

// root.get('/login', (req, res) => {
//     if (req.user) return res.redirect('/')
//     return res.render('login')
// })

// root.get('/logout', (req, res) => {
//     if (!req.user) return res.redirect('/login')
//     res.clearCookie('secret')
//     return res.redirect('/login')
// })

export default root
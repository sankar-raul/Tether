import express from 'express'
import { search, userRoot } from '../controllers/user.controller.js'
const user = express.Router()

user.get('/', userRoot)
user.get('/search', search)

export default user
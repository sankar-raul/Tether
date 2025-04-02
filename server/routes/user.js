import express from 'express'
import { userRoot, search } from '../controllers/user.js'
const user = express.Router()

user.get('/', userRoot)
user.get('/search', search)

export default user
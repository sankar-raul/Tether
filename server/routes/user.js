import express from 'express'
import { userRoot } from '../controllers/user.js'
const user = express.Router()

user.get('/', userRoot)

export default user
import { Router } from "express"
import { deleteUser, login, register, update } from "../controllers/auth.js"
import { restrictedRoute } from "../middleware/auth.js"

const auth = Router()

// endpoint to register new user -> POST auth/register
auth.post('/register', register)

// endpoint to login user -> POST /auth/login
auth.post('/login', login)

// endpoint to update password | username -> PUT /auth/update/:what -> ( password | username )
auth.put('/update/:what', restrictedRoute, update)


auth.put('/forgot', (req, res) => {
    res.end("ok")
})

// api endpoint to delete user -> DELETE /auth/delete
auth.delete('/delete', restrictedRoute, deleteUser)

// handle all /auth/* route || /auth/* endpoint fallback
auth.use((req, res) => {
    res.status(404).json({success: false, msg: "invalid endpoint!"})
})


export default auth
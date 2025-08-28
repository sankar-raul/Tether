import { Router } from "express"
import { deleteUser, login, logout, refreshToken, resendOtp, start_registration, update, varifyOtp } from "../controllers/auth.controller.js"
import { restrictedRoute } from "../middleware/auth.middleware.js"

const auth = Router()

// endpoint to register new user -> POST auth/register
auth.post('/start_registration', start_registration)
auth.post('/varify/:otp_token', varifyOtp) // POST auth/varify
auth.post('/reesend-otp/:otp_token', resendOtp) // POST auth/varify

// endpoint to login user -> POST /auth/login
auth.post('/login', login)

// endpoint to update password | username -> PUT /auth/update/:what -> ( password | username )
auth.put('/update/:what', restrictedRoute, update)


auth.put('/forgot', (req, res) => {
    res.end("working on it 😵‍💫") // need to work on it
})

// used for token refreshing
auth.post('/refresh_token', refreshToken)

auth.post('/logout', logout)
// api endpoint to delete user -> DELETE /auth/delete
auth.delete('/delete', restrictedRoute, deleteUser)

// handle all /auth/* route || /auth/* endpoint fallback
auth.use((req, res) => {
    res.status(404).json({success: false, msg: "invalid endpoint!"})
})


export default auth
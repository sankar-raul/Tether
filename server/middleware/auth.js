import { getUser } from "../service/auth.js"
import { AccessToken } from "../service/authToken.js"

export const softAuthCheck = (req, res, next) => {
    const token = req.cookies.access_token
    // console.log(token)
    if (!token) {
        return next()
    }
    const user = AccessToken.get(token)
    // console.log(user)
    if (!user) return next()
    req.user = user
    next()
}

export const restrictedRoute = (req, res, next) => {
    const token = req.cookies.access_token
    if (!token) return res.status(401).json({success: false, msg: "unauthorized!"})
    const user = AccessToken.get(token)
    if (!user) return res.status(401).json({success: false, msg: "unauthorized!"})
    req.user = user
    next()
}
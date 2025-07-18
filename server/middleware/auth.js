// import { getUser } from "../service/auth.js"
import { AccessToken } from "../service/authToken.js"

export const softAuthCheck = (req, res, next) => {
    // const token = req.cookies.access_token
    const access_token = req.headers.authorization?.split(' ')[1]
    if (!access_token) {
        return next()
    }
    const user = AccessToken.get(access_token)
    // console.log(user)
    if (!user) return next()
    req.user = user
    next()
}

export const restrictedRoute = (req, res, next) => {
    // const token = req.cookies.access_token
    const access_token = req.headers.authorization?.split(' ')[1]
    if (!access_token) return res.status(401).json({success: false, msg: "unauthorized!"})
    const user = AccessToken.get(access_token)
    if (!user) return res.status(401).json({success: false, msg: "unauthorized!"})
    req.user = user
    next()
}
import { getUser } from "../service/auth.js"

export const softAuthCheck = (req, res, next) => {
    const token = req.cookies.secret
    // console.log(token)
    if (!token) {
        return next()
    }
    const user = getUser(token)
    // console.log(user)
    if (!user) return next()
    req.user = user
    next()
}

export const restrictedRoute = (req, res, next) => {
    const token = req.cookies.secret
    if (!token) return res.status(401).json({success: false, msg: "unauthorized!"})
    const user = getUser(token)
    if (!user) return res.status(401).json({success: false, msg: "unauthorized!"})
    req.user = user
    next()
}
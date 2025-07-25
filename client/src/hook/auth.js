import axios from "axios"
import apiRequest, { backend_uri } from "./apiRequest"
import socket from "../utils/chatSocket"

class AuthController {
    constructor() {
       
    }
    async varifyOtp({otp, otp_token}) {
        if (!otp || !otp_token) return [null, null]
        const [ data, error ] = await apiRequest(`/auth/varify/${otp_token}`, {data: {
            otp,
        }, method: "POST"})
        return [data, error]
    }
    async login({formData}) {
        if (!formData) return [null, {msg: "invaild formdata"}]
        const [ data, error ] = await apiRequest('/auth/login', {
            method: "POST",
            body: formData
        })
        if (data?.success) {
            const { access_token, refresh_token } = data.auth_credentials
            localStorage.setItem('access_token', access_token)
            localStorage.setItem('refresh_token', refresh_token)
        }
        return [data, error]
    }
    async logout() {
        const refresh_token = localStorage.getItem("refresh_token")
        if (!refresh_token) return
        const [ logoutResponse, error ] = await apiRequest("/auth/logout", {
            method: "POST",
            body: {
                refresh_token
            }
        })
        if (logoutResponse?.success) {
            localStorage.removeItem("refresh_token")
            localStorage.removeItem("access_token")
        }
        return [ logoutResponse, error ]
    }
    async signup({formData}) {
        if (!formData) return [null, {msg: "invaild formdata"}]
        const [ data, error ] = await apiRequest('/auth/start_registration', {
            method: "POST",
            body: formData
        })
        // console.log(data)
        return [data, error]
    }

    async refreshToken() {
        const refresh_token = localStorage.getItem('refresh_token')
        if (!refresh_token) return {success: false, error: {msg: "access_denied", action: 'force_logout'}}
        try {
            const response = await axios(`${backend_uri}/auth/refresh_token`, {
                method: "POST",
                data: {
                    refresh_token: refresh_token
                }
            })
            const data = response.data
            if (data?.success) {
                const { refresh_token, access_token } = data
                localStorage.setItem('refresh_token', refresh_token)
                localStorage.setItem('access_token', access_token)
                // console.log("refresh")
                if (socket.connected) {
                    socket.once('disconnect', () => {
                        socket.connect()
                    })
                    socket.disconnect()
                } else {
                    socket.connect()
                }
                return {success: true}
            } else {
                // console.log(error.msg)
                return {success: false, error: {msg: data?.msg || "error"}}
            }
        } catch (error) {
            return {success: false, error: {msg: "error", details: error}}
        }
    }
}

const Auth = new AuthController()
export default Auth
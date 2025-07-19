import axios from "axios"
import apiRequest, { backend_uri } from "./apiRequest"
import socket from "../utils/chatSocket"

class AuthController {
    constructor() {
       
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
        const [ data, error ] = await apiRequest('/auth/register', {
            method: "POST",
            body: formData
        })
        // console.log(data)
        if (data?.success) {
            const { access_token, refresh_token } = data.auth_credentials
            localStorage.setItem('access_token', access_token)
            localStorage.setItem('refresh_token', refresh_token)
        }
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
                if (socket.connected) {
                    socket.disconnect()
                }
                socket.connect()
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
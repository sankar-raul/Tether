import apiRequest from "../../hook/apiRequest"

export const refresh = async () => {
    try {
        const data = await apiRequest(`/auth/refresh_token`, { method: 'POST' })
        return {success: data.success, token: data.access_token}
    } catch (error) {
        console.log(error)
        return {type: 'error', error: error.code}
    }
}
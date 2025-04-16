import apiRequest from "../../hook/apiRequest"

export const refresh = async () => {
    const [data, error] = await apiRequest(`/auth/refresh_token`, { method: 'POST' })
    // console.log(data, error)
    if (data)
        return {success: data.success, token: data.access_token}
    else {
        // console.log(error.msg)
        return {success: false, error: error.msg}
    }
}
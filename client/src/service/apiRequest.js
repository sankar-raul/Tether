import axios from "axios"

const apiRequest = async (endpoint, details) => {
    let body = details?.body
    let method = details?.method
    const backend ='http://localhost:8080'
    // console.log(body)
    try {
        const response = await axios(`${backend}${endpoint}`, {
            method: method || 'GET',
            data: body,
            withCredentials: true,
        })
        const data = response.data
        return [data, null]
    } catch (e) {
        // console.log(e)
        switch (e.code) {
            case "ERR_NETWORK":
                return [null, {success: false, msg: "net error"}]
        }
        return [null, e.response.data]
    }
    
}
export default apiRequest
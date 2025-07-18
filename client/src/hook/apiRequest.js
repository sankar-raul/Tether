import axios from "axios"
import PropTypes from 'prop-types'

let ENV = import.meta.env.VITE_API_ENV
let server = import.meta.env.VITE_API_URI
export let backend_uri = ENV == 'dev' ? server.replace('localhost', location.hostname) : server

// export const refreshToken = async () => {
//     const token  = localStorage.getItem('refresh_token')
//     if (token) {
//         const response = await axios(`${backend_uri}`)
//     }
// }

const apiRequest = async (endpoint, details = {}) => {
    let method = details?.method
    // console.log({...details})
    const access_token = localStorage.getItem('access_token')
    try {
        const response = await axios(`${backend_uri}${endpoint}`, {
            method: method || 'GET',
            data: details.body,
            ...details,
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        })
        const data = response.data
        // console.log(response, 'oppp')
        return [data, null]
    } catch (e) {
        // console.log(e.response)
        switch (e.code) {
            case "ERR_NETWORK":
                return [null, {success: false, msg: "net error" }]
            case "ERR_CANCELED":
                return [null, {success: false, msg: e.message }]
            default:
                return [ null, e.response?.data ]
        }
        // console.log(e)
        // return [null, e.response?.data]
    }
}
apiRequest.propTypes = {
    endpoint: PropTypes.string.isRequired,
    details: PropTypes.object
}
export default apiRequest
import axios from "axios"
import PropTypes from 'prop-types'

let backend_uri = import.meta.env.VITE_API_URI
let ENV = import.meta.env.VITE_API_ENV

if (ENV == 'dev') {
    backend_uri = backend_uri.replace('localhost', location.hostname)
}
const apiRequest = async (endpoint, details = {}) => {
    let method = details?.method
    // console.log({...details})
    try {
        const response = await axios(`${backend_uri}${endpoint}`, {
            method: method || 'GET',
            data: details.body,
            ...details,
            withCredentials: true,
        })
        const data = response.data
        // console.log(response, 'oppp')
        return [data, null]
    } catch (e) {
        // console.log(e)
        switch (e.code) {
            case "ERR_NETWORK":
                return [null, {success: false, msg: "net error" }]
            case "ERR_CANCELED":
                return [null, {success: false, msg: e.message }]
        }
        // console.log(e)
        return [null, e.response?.data]
    }
}
apiRequest.propTypes = {
    endpoint: PropTypes.string.isRequired,
    details: PropTypes.object
}
export default apiRequest
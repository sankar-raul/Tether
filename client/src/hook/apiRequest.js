import axios from "axios"
import PropTypes from 'prop-types'

const apiRequest = async (endpoint, details = {}) => {
    let method = details?.method
    const backend_uri = import.meta.env.VITE_API_URI
    console.log({...details})
    try {
        const response = await axios(`${backend_uri}${endpoint}`, {
            method: method || 'GET',
            data: details.body,
            ...details,
            withCredentials: true,
        })
        const data = response.data
        console.log(response, 'oppp')
        return [data, null]
    } catch (e) {
        console.log(e)
        switch (e.code) {
            case "ERR_NETWORK":
                return [null, {success: false, msg: "net error"}]
            case "ERR_CANCELED":
                return [null, {success: false, msg: e.message}]
        }
        console.log(e)
        return [null, e.response?.data]
    }
}
apiRequest.propTypes = {
    endpoint: PropTypes.string.isRequired,
    details: PropTypes.object
}
export default apiRequest
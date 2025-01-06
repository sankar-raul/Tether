import axios from "axios"

const apiRequest = async (endpoint, { body, method }) => {
    const backend ='http://localhost:8080'
    try {
        const response = await axios(`${backend}${endpoint}`, {
            method: method || 'GET',
            data: body
        })
        const data = response.data
        console.log(response)
        return [data, null]
    } catch (e) {
        // console.log(e)
        return [null, e.response.data]
    }
    
}
export default apiRequest
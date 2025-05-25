import { io } from "socket.io-client"

let backend_uri = import.meta.env.VITE_API_URI
const env = import.meta.env.VITE_API_ENV

if (env == 'dev') (backend_uri = backend_uri.replace('localhost', location.hostname))

const socket = io(backend_uri, {
    withCredentials: true
})
export default socket
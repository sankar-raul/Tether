import { createContext, useContext } from "react"

export const SocketContext = createContext()
const useSocket = () => useContext(SocketContext)
export default useSocket
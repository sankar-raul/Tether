import { createContext, useContext } from "react"

export const AuthContext = createContext()
const useAuth = () => useContext(AuthContext)
export default useAuth
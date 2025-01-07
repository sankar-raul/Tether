import { createContext, useContext } from "react"

export const userInfoContext = createContext()
const useUserInfo = () => useContext(userInfoContext)
export default useUserInfo
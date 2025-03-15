import { createContext, useContext } from "react"

export const AlertContext = createContext()
const useAlert = () => useContext(AlertContext)
export default useAlert
import { createContext, useContext } from "react"

export const CallContext = createContext()

const useCall = () => useContext(CallContext)
export default useCall
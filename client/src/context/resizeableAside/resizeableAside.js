import { createContext, useContext } from "react"

export const resizeableContext = createContext()
const useResize = () => useContext(resizeableContext)
export default useResize
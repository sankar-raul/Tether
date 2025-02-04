import { createContext, useContext } from "react"

export const chatContext = createContext()

const useChat = () => useContext(chatContext)
export default useChat
import { createContext, useContext } from "react";

export const MessageContext = createContext()
const useMessages = () => useContext(MessageContext)
export default useMessages
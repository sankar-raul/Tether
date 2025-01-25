import { createContext, useContext } from "react"

export const contactsContext = createContext()

const useContacts = () => useContext(contactsContext)
export default useContacts
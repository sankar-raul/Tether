import { createContext, useContext } from "react"

export const ConfirmContext = createContext()
const useConfirm = () => useContext(ConfirmContext)
export default useConfirm
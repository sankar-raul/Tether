import { createContext, useContext } from "react"

export const tabsContext = createContext()

const useTabs = () => useContext(tabsContext)
export default useTabs
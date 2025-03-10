import { createContext, useContext } from "react"

export const SearchContext = createContext()
const useSearch = () => useContext(SearchContext)
export default useSearch
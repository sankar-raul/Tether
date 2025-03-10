import { useCallback, useEffect, useState } from "react"
import { SearchContext } from "./searchContext"
import PropTypes from 'prop-types'
import apiRequest from "../../hook/apiRequest"

const SearchCache = new Map() // endpoint -> data

const SearchProvider = ({children}) => {
    const [ isSearchFocused, setIsSearchFocused ] = useState(false)
    const [ searchValue, setSearchValue ] = useState('')
    const [ endPoint, setEndPoint ] = useState(null)
    const [ searchResults, setSearchResults ] = useState(null)

    const clearSearchCache = useCallback(() => {
        SearchCache.clear()
    }, [])

    const searchPreview = useCallback(async () => {
        if (searchValue.length <= 2) {
            setSearchResults(null)
            return
        }
        let data, error
        if (SearchCache.has(endPoint)) {
            data = SearchCache.get(endPoint)
            setSearchResults(data)
        } else {
            [data, error] = await apiRequest(endPoint)
            if (error) {
                alert("error while search!")
                console.log(error)
            } else {
                setSearchResults(data?.data)
                SearchCache.set(endPoint, data?.data)
            }
        }
        
    }, [searchValue, endPoint])
    const search = useCallback((e) => {
        e.preventDefault()
    }, [])
    useEffect(() => {
        console.log(searchResults)
    }, [searchResults])
    useEffect(() => {
        searchPreview()
    }, [endPoint])
    useEffect(() => {
        setEndPoint(`/user/search?q=${searchValue}`)
    }, [searchValue])

    return (
        <SearchContext.Provider value={{isSearchFocused, setIsSearchFocused, searchValue, setSearchValue, search, clearSearchCache, searchResults}}>
            {children}
        </SearchContext.Provider>
    )
}
SearchProvider.propTypes = {
    children: PropTypes.node.isRequired
}
export default SearchProvider
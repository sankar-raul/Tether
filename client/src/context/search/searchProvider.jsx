import { useCallback, useEffect, useState } from "react"
import { SearchContext } from "./searchContext"
import PropTypes from 'prop-types'
import apiRequest from "../../hook/apiRequest"
import useAlert from '../alert/Alert'

const SearchCache = new Map() // endpoint -> data

const SearchProvider = ({children}) => {
    const [ isSearchFocused, setIsSearchFocused ] = useState(false)
    const [ searchValue, setSearchValue ] = useState('')
    const [ endPoint, setEndPoint ] = useState(null)
    const [ searchResults, setSearchResults ] = useState(null)
    const { Alert } = useAlert()
    const [isLoading, setIsLoading] = useState(false)

    const clearSearchCache = useCallback(() => {
        SearchCache.clear()
    }, [])

    const searchPreview = useCallback(async ({signal}) => {
        let data, error
        if (searchValue.length <= 2) return
        if (SearchCache.has(endPoint)) {
            data = SearchCache.get(endPoint)
            setSearchResults(data)
        } else {
            setIsLoading(true);
            [data, error] = await apiRequest(endPoint, {signal})
            if (error) {
                if (error.msg == "net error") {
                    Alert({message: error.msg, type: "error"})
                    setIsLoading(false)
                } else if (error.msg == 'canceled') {
                    //
                } else {
                    setIsLoading(false)
                }
                // console.log(error)
            } else {
                setSearchResults(data?.data)
                setIsLoading(false)
                SearchCache.set(endPoint, data?.data)
            }
        }
    }, [endPoint, Alert, searchValue])
    const search = useCallback((e) => {
        e.preventDefault()
    }, [])
    useEffect(() => {
        console.log(searchResults)
    }, [searchResults])
    useEffect(() => {
        if (!endPoint) return
        const Controller = new AbortController()
        searchPreview({signal: Controller.signal})
        return () => {
            Controller.abort()
        }
    }, [endPoint])
    useEffect(() => {
        if (searchValue.length > 1)
            setEndPoint(`/user/search?q=${searchValue}`)
        else {
            setIsLoading(false)
            setSearchResults(null)
        }
    }, [searchValue])

    return (
        <SearchContext.Provider value={{isSearchFocused, setIsSearchFocused, searchValue, setSearchValue, search, clearSearchCache, searchResults, isLoading}}>
            {children}
        </SearchContext.Provider>
    )
}
SearchProvider.propTypes = {
    children: PropTypes.node.isRequired
}
export default SearchProvider
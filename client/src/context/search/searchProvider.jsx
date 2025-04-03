import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { SearchContext } from "./searchContext"
import PropTypes from 'prop-types'
import apiRequest from "../../hook/apiRequest"
import useAlert from '../alert/Alert'
import { debounce } from '../../utils/helperFunctions'

const SearchCache = new Map() // endpoint -> data

const SearchProvider = ({children}) => {
    const [ isSearchFocused, setIsSearchFocused ] = useState(false)
    const [ searchValue, setSearchValue ] = useState('')
    // const [ endPoint, setEndPoint ] = useState(null)
    const [ searchResults, setSearchResults ] = useState(null)
    const { Alert } = useAlert()
    const [isLoading, setIsLoading] = useState(false)

    const clearSearchCache = useCallback(() => {
        SearchCache.clear()
    }, [])

    const searchPreview = useCallback(async (searchFor, {signal}) => {
        let data, error
        const endPoint = `/user/search?q=${searchFor}`
        console.log("here")
        console.log(searchFor.length)
        if (searchFor.length <= 2) return
        if (SearchCache.has(endPoint)) {
            data = SearchCache.get(endPoint)
            setSearchResults(data)
            setIsLoading(false)
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
    }, [Alert])

    const searchDebounce = useRef(debounce(searchPreview, 300))

    const search = useCallback((e) => {
        e.preventDefault()
    }, [])

    useEffect(() => {
        console.log(searchResults)
    }, [searchResults])
   
    const initiateSearch = useCallback((searchFor) => {
        const Controller = new AbortController()
        searchDebounce.current(searchFor, {signal: Controller.signal})
        // console.log(searchDebounce.current)
        // console.log('op')
        return () => {
            Controller.abort()
        }
    }, [])

    useEffect(() => {
        if (searchValue.length > 1) {
            const abort = initiateSearch(searchValue)
            return abort
        } else {
            setIsLoading(false)
            setSearchResults(null)
        }
    }, [searchValue, initiateSearch])

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
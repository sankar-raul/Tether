import { useCallback, useEffect, useRef, useState } from "react"
import { SearchContext } from "./searchContext"
import PropTypes from 'prop-types'
import apiRequest from "../../hook/apiRequest"
import useAlert from '../alert/Alert'
import { debounce } from '../../utils/helperFunctions'

const SearchCache = new Map() // endpoint -> data & next

const SearchProvider = ({children}) => {
    const [ isSearchFocused, setIsSearchFocused ] = useState(false)
    const [ searchValue, setSearchValue ] = useState('')
    // const [ endPoint, setEndPoint ] = useState(null)
    const [ searchResults, setSearchResults ] = useState(null)
    const [ searchResponse, setSearchResponse ] = useState({})
    const [ cache, setCache ] = useState(new Map())
    const { Alert } = useAlert()
    const [isLoading, setIsLoading] = useState(false)

    const clearSearchCache = useCallback(() => {
        SearchCache.clear()
    }, [])

    const searchPreview = useCallback(async (searchFor, {signal, uri}) => {
        let data, error
        const endPoint = uri ? uri : `/user/search?q=${searchFor}`
        // console.log(endPoint)
        if (searchFor.length <= 2 && !uri) return
        if (SearchCache.has(endPoint)) {
            data = SearchCache.get(endPoint).get('data')
            // console.log(data)
            if (!uri) {
                setSearchResults(data)
                setIsLoading(false)
                setSearchResponse(prev => ({...prev, next: SearchCache.get(endPoint).get('next')}))
            } else {
                // return data
            }
        } else {
             !uri && setIsLoading(true);
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
                setSearchResponse({part: data?.part, next: data?.next, query: data?.query})
                if (uri) {
                    const base = endPoint.split('&')[0]
                    const newMap = new Map()
                    newMap.set('data', [...SearchCache.get(base).get('data'), ...data.data])
                    newMap.set('next', data?.next)
                    SearchCache.set(base, newMap)
                    setCache(new Map(SearchCache))
                    return data?.data
                }
                setSearchResults(data?.data)
                setIsLoading(false)
                const newMap = new Map()
                newMap.set('data', data?.data)
                newMap.set('next', data?.next)
                SearchCache.set(endPoint, newMap)
                setCache(new Map(SearchCache))
            }
        }
    }, [Alert])

    const searchDebounce = useRef(debounce(searchPreview, 300))

    const search = useCallback((e) => {
        e.preventDefault()
    }, [])

    useEffect(() => {
        // console.log(searchResults)
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

    const loadMore = useCallback(async (uri) => {
        // console.log("okoojojo")
        if (!uri) return
        const data = await searchPreview('', {uri})
        // console.log(data, "sankar is my name")
        setSearchResults(prev => [...prev, ...data])
    }, [searchPreview])

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
        <SearchContext.Provider value={{isSearchFocused, setIsSearchFocused, searchValue, setSearchValue, search, clearSearchCache, searchResults, isLoading, searchResponse, loadMore, cache}}>
            {children}
        </SearchContext.Provider>
    )
}
SearchProvider.propTypes = {
    children: PropTypes.node.isRequired
}
export default SearchProvider
import { useEffect } from 'react'
import useSearch from '../../../context/search/searchContext'
import styles from './search-window.module.css'

const SearchWindow = () => {
    const { setIsSearchFocused, searchValue, clearSearchCache, searchResults } = useSearch()

    useEffect(() => {
        const hideSearchWindow = () => setIsSearchFocused(false)
        window.addEventListener('click', hideSearchWindow)
        return () => {
            clearSearchCache()
            window.removeEventListener('click', hideSearchWindow)
        }
    }, [setIsSearchFocused, clearSearchCache])
    return (
        <>
        <div className={styles['search-window']}>
            <div onClick={(e) => e.stopPropagation()} className={styles['search-results']}>
                Search results for {`"${searchValue}"`}
                <div>
                    {searchResults ? searchResults.map((user, idx) => (
                        <p key={idx}>
                            {user.username}
                        </p>
                    )) : 'Nothing here!'}
                </div>
            </div>
        </div>
        </>
    )
}
export default SearchWindow
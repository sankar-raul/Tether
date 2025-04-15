import styles from './header.module.css'
import searchIcon from '../../../assets/svg/chat/search-icon.svg'
import { SearchWindow } from '../SearchWindow/SearchWindow'
import SearchProvider from '../../../context/search/searchProvider'
import useSearch from '../../../context/search/searchContext'
import { useCallback, useEffect, useRef } from 'react'
import { DefaultUser } from '../../DefaultUser/DefaultUser'
import { useMediaQuery } from 'react-responsive'

const Header = () => {
    const isMobile = useMediaQuery({ query: '(max-width: 700px)'})

    return (
        <div className={styles.header}>
            <div className={styles['app-name']}><h1>Tether</h1></div>
            <SearchProvider>
                <Search />
            </SearchProvider>
            <div className={styles['user']}>
                <DefaultUser />
            </div>
        </div>
    )
}
export default Header

const Search = () => {
    const { setIsSearchFocused, isSearchFocused, searchValue, setSearchValue, search } = useSearch()
    const searchRef = useRef(null)
    const isMobile = useMediaQuery({ query: '(max-width: 700px)'})

    const handleSearchInput = useCallback((e) => {
        setSearchValue(e.target.value)
    }, [setSearchValue])
    
    const handleFocus = () => {
        searchRef && searchRef.current.focus()
    }

    useEffect(() => {
        isSearchFocused && handleFocus()
        // console.log(isSearchFocused)
    }, [isSearchFocused])

    return (
        <div className={`${styles['search-wraper']} ${isSearchFocused ? styles['search-focused'] : ''}`}>
        <form onSubmit={search} onClick={(e) => e.stopPropagation()} className={styles['search-box']} onFocus={() => setIsSearchFocused(true)}>
            <div className={`${styles['search-input-wraper']} ${isSearchFocused ? styles['search-focused'] : ''}`}>
                <input ref={searchRef} className={styles['search-input']} type="text" placeholder='search for an user' value={searchValue} onInput={handleSearchInput} />
            </div>
            <button onClick={() => isMobile ? setIsSearchFocused(true) : {}} type='submit' className={styles['search-button']}>
                <img src={searchIcon} alt="search" />
            </button>
        </form>
        {isSearchFocused ? <SearchWindow /> : ''}
        </div>
    )
}
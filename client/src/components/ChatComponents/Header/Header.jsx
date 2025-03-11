import styles from './header.module.css'
import searchIcon from '../../../assets/svg/chat/search-icon.svg'
import { SearchWindow } from '../SearchWindow/SearchWindow'
import SearchProvider from '../../../context/search/searchProvider'
import useSearch from '../../../context/search/searchContext'
import { useCallback } from 'react'
import { DefaultUser } from '../../DefaultUser/DefaultUser'

const Header = () => {

    return (
        <div className={styles.header}>
            <h1 className={styles['app-name']}>Tether</h1>
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
    const handleSearchInput = useCallback((e) => {
        setSearchValue(e.target.value)
    }, [setSearchValue])
    return (
        <div className={styles['search-wraper']}>
        <form onSubmit={search} onClick={(e) => e.stopPropagation()} className={styles['search-box']} onFocus={() => setIsSearchFocused(true)}>
            <div className={styles['search-input-wraper']}>
                <input className={styles['search-input']} type="text" placeholder='search for an user' value={searchValue} onInput={handleSearchInput} />
            </div>
            <button type='submit' className={styles['search-button']}>
                <img src={searchIcon} alt="search" />
            </button>
        </form>
        {isSearchFocused ? <SearchWindow /> : ''}
        </div>
    )
}
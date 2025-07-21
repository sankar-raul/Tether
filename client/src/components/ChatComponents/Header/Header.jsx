import styles from './header.module.css'
import searchIcon from '../../../assets/svg/chat/search-icon.svg'
import { SearchWindow } from '../SearchWindow/SearchWindow'
import SearchProvider from '../../../context/search/searchProvider'
import useSearch from '../../../context/search/searchContext'
import { useCallback, useEffect, useRef } from 'react'
import { DefaultUser } from '../../DefaultUser/DefaultUser'
import { useMediaQuery } from 'react-responsive'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import useUserInfo from '../../../context/userInfo/userInfo'

const Header = () => {
    const isMobile = useMediaQuery({ query: '(max-width: 700px)'})
    const { userInfo } = useUserInfo()
// console.log(userInfo)

    return (
        <div className={styles.header}>
            { isMobile ? <FontAwesomeIcon icon={faChevronLeft} className={styles['chevronLeft']} /> : '' }
            <div className={styles['app-name']}><h1>Tether</h1></div>
            <SearchProvider>
                <Search />
            </SearchProvider>
            <div className={styles['user']}>
                {userInfo?.profile_pic_url ? <img src={userInfo.profile_pic_url} alt="profile_photo" /> : <DefaultUser />}
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
                <input ref={searchRef} className={styles['search-input']} type="text" placeholder='search for an new contact' value={searchValue} onInput={handleSearchInput} />
            </div>
            <button onClick={() => isMobile ? setIsSearchFocused(true) : {}} type='submit' className={styles['search-button']}>
                <img src={searchIcon} alt="search" />
            </button>
        </form>
        {isSearchFocused ? <SearchWindow /> : ''}
        </div>
    )
}
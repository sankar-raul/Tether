import { useCallback, useEffect } from 'react'
import useSearch from '../../../context/search/searchContext'
import styles from './search-window.module.css'
import PropTypes from 'prop-types'
import { Loader } from '../../Loader/Loader'
import { DefaultUser } from '../../DefaultUser/DefaultUser'
import useContacts from '../../../context/contacts/contact'
import useIntersectionObserver from '../../../hook/useIntersectionBbserver'

export const SearchWindow = () => {
    const { setIsSearchFocused, searchValue, clearSearchCache, searchResults, isLoading, searchResponse } = useSearch()
    
    // useEffect(() => {
    //     // console.log(isVisible)
    // }, [isVisible])
    useEffect(() => {
        const hideSearchWindow = () => setIsSearchFocused(false)
        window.addEventListener('click', hideSearchWindow)
        return () => {
            clearSearchCache()
            window.removeEventListener('click', hideSearchWindow)
        }
    }, [setIsSearchFocused, clearSearchCache])

    useEffect(() => {
        console.log(searchResults)
    }, [searchResults])
    return (
        <>
        <div className={styles['search-window']}>
            <div onClick={(e) => e.stopPropagation()} className={styles['search-results']}>
                {searchValue.length > 2 ? <div className={styles['result-for']}>
                    Search results for {`"${searchValue}"`}
                </div> : '' 
                }
                <div className={styles['results']}>
                    <>
                    {isLoading ? <Loader /> :
                    searchResults ? (
                    <>
                        {searchResults.map((user, idx) => (
                        <ShowUser key={idx} info={user} />
                    ))}
                    <div className={styles['load-more']}>
                    {
                        searchResponse?.next ? (
                            <LoadMore />
                        ) : ( 
                        <div>
                            No more results
                        </div>
                        )
                    }
                    </div>
                    </>
                ) : <div className={styles['result-for']}></div>
                }
                </>
                </div>
            </div>
        </div>
        </>
    )
}

const LoadMore = () => {
    const { searchResponse, loadMore } = useSearch()
    const [ ref, isVisible ] = useIntersectionObserver({threshold: 0.9})
    
    useEffect(() => {
        console.log(isVisible)
        isVisible && loadMore(searchResponse.next)
    }, [isVisible, loadMore, searchResponse])
    return (
        <div ref={ref}>
            Loading more...
        </div> 
    )
}

const ShowUser = ({info}) => {
    const { setSelectedContact, updateContactInfo } = useContacts()
    const { setIsSearchFocused } = useSearch()

    const startTethering = useCallback(() => {
        updateContactInfo(info.id, info)
        setSelectedContact(info.id)
        setIsSearchFocused(false)
        // shiftUpContact(info.id, {})
        // console.log('first')
    }, [info, updateContactInfo, setSelectedContact, setIsSearchFocused])

    return (
        <div className={styles['show-user']} onClick={startTethering}>
            <div className={styles['show-user-info']}>
                <div className={styles['avatar']}><DefaultUser /></div>
                {/* <div className={styles['avatar']}>ava</div> */}
                <div>
                    <div className={styles['username']}>{info.username}</div>
                    <div className={styles['bio']}>{info.bio || 'Friends are just a text away'}</div>
                </div>
            </div>
            <div className={styles['msg-btn']}>
                <button>
                    Message
                </button>
            </div>
        </div>
    )
}
ShowUser.propTypes = {
    info: PropTypes.object.isRequired
}
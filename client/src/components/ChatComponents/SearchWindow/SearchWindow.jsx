import { useCallback, useEffect, useState } from 'react'
import useSearch from '../../../context/search/searchContext'
import styles from './search-window.module.css'
import PropTypes from 'prop-types'
import { Loader } from '../../Loader/Loader'
import { DefaultUser } from '../../DefaultUser/DefaultUser'
import useContacts from '../../../context/contacts/contact'
import useIntersectionObserver from '../../../hook/useIntersectionBbserver'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { Skeleton } from '@mui/material'

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
                    <div>Search results for <span>{`${searchValue}`}</span></div>
                    <div onClick={() => setIsSearchFocused(false)}>
                        <FontAwesomeIcon icon={faXmark} fontSize={24} className={styles['btn-icon']}/>
                    </div>
                </div> : '' 
                }
                <div className={styles['results']}>
                    <>
                    { isLoading ? <Loader type={'skeleton'} /> :
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
                        <div className={styles['no-more-result']}>
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
    const [ ref, isVisible ] = useIntersectionObserver({threshold: 0.3})
    // const [ doLoad, setDoLoad ] = useState(true)
    useEffect(() => {
        console.log(isVisible)
        isVisible && loadMore(searchResponse.next)
    
    }, [isVisible, loadMore, searchResponse])
    return (
        <div ref={ref}>
            <ShowUser skeleton={true} />
            <ShowUser skeleton={true} animationDelay={'0s'} />
        </div> 
    )
}

export const ShowUser = ({info, skeleton, animationDelay = 0}) => {
    const { setSelectedContact, updateContactInfo } = useContacts()
    const { setIsSearchFocused } = useSearch()

    const startTethering = useCallback(() => {
        if (skeleton) return
        updateContactInfo(info.id, info)
        setSelectedContact(info.id)
        setIsSearchFocused(false)
        // shiftUpContact(info.id, {})
        // console.log('first')
    }, [info, updateContactInfo, setSelectedContact, setIsSearchFocused, skeleton])

    return (
        <div className={styles['show-user']} onClick={startTethering}>
            <div className={styles['show-user-info']}>
                <div className={styles['avatar']}>{ skeleton ? <Skeleton variant='circular' height='40px' width='40px' sx={{background: 'var(--skeleton-accent-color)', animationDelay: animationDelay}} /> : <DefaultUser />}</div>
                {/* <div className={styles['avatar']}>ava</div> */}
                <div>
                    <div className={styles['username']}>{skeleton ? <Skeleton variant='text' width='clamp(20px, 40%, 100px)' height='90%' sx={{background: 'var(--skeleton-accent-color)', animationDelay: animationDelay}} /> : info?.username || 'username'}</div>
                    <div className={styles['bio']}>{skeleton ? <Skeleton variant='text' width='clamp(35px, 60%, 150px)' height='100%' sx={{background: 'var(--skeleton-accent-color)', animationDelay: animationDelay}} /> : info?.bio || 'Friends are just a text away'}</div>
                </div>
            </div>
            <div className={styles['msg-btn']}>
                {!skeleton ? <button>
                    Message
                </button> : <Skeleton variant='rectangular' height='80%' sx={{background: 'var(--skeleton-accent-color)', minWidth: '80px', animationDelay: animationDelay}} />}
            </div>
        </div>
    )
}
ShowUser.propTypes = {
    info: PropTypes.object,
    skeleton: PropTypes.bool,
    animationDelay: PropTypes.string
}
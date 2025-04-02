import { useCallback, useEffect, useState } from 'react'
import useSearch from '../../../context/search/searchContext'
import styles from './search-window.module.css'
import PropTypes from 'prop-types'
import { Loader } from '../../Loader/Loader'
import { DefaultUser } from '../../DefaultUser/DefaultUser'
import useContacts from '../../../context/contacts/contact'

export const SearchWindow = () => {
    const { setIsSearchFocused, searchValue, clearSearchCache, searchResults, isLoading } = useSearch()

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
                <div className={styles['result-for']}>
                    Search results for {`"${searchValue}"`}
                </div>
                <div className={styles['results']}>
                    <>
                    {isLoading ? <Loader /> :
                    searchResults ? searchResults.map((user, idx) => (
                        <ShowUser key={idx} info={user} />
                    )) : <div className={styles['result-for']}>Nothing here!</div>
                }
                </>
                </div>
            </div>
        </div>
        </>
    )
}

const ShowUser = ({info}) => {
    const { shiftUpContact, setSelectedContact, updateContactInfo, contactMap, selectedContact } = useContacts()
    const { setIsSearchFocused } = useSearch()

    const startTethering = useCallback(() => {
        updateContactInfo(info.id, info)
        setSelectedContact(info.id)
        setIsSearchFocused(false)
        shiftUpContact(info.id, {})
        console.log('first')
    }, [info, updateContactInfo, shiftUpContact, setSelectedContact, setIsSearchFocused])

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
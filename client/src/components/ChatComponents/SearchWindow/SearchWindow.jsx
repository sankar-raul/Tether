import { useCallback, useEffect, useState } from 'react'
import useSearch from '../../../context/search/searchContext'
import styles from './search-window.module.css'
import PropTypes from 'prop-types'
import { Loader } from '../../Loader/Loader'
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
                Search results for {`"${searchValue}"`}
                <div>
                    <>
                    {isLoading ? <Loader /> :
                    searchResults ? searchResults.map((user, idx) => (
                        <ShowUser key={idx} info={user} />
                    )) : 'Nothing here!'
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
        <p onClick={startTethering}>
            {info.username}
        </p>
    )
}
ShowUser.propTypes = {
    info: PropTypes.object.isRequired
}
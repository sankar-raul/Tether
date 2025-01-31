import { useCallback, useEffect, useState } from "react"
import { contactsContext } from "./contact"
import PropTypes from 'prop-types'
import useUserInfo from "../userInfo/userInfo"
import apiRequest from '../../hook/apiRequest'

const ContactsProvider = ({children}) => {
    const [ selectedContact, setSelectedContact ] = useState(null)
    const { userInfo } = useUserInfo()
    const [ contacts, setContacts ] = useState()
    const [ contactMap, setContactMap ] = useState(new Map())

    const getContacts = useCallback(async () => {
        // call api to get first 20 contacts with recent message
        const [ response, error ] = await apiRequest('/chat/contacts')
        if (!error) {
            // console.log(response?.data)
            setContacts(response?.data)
            setContactMap(new Map(response?.data?.slice().reverse().map(item => [item.id, {}])))
        }
    }, [])
    const addContact = useCallback((id, data = {}) => {
        if (contactMap.has(id)) {
            const prevData = contactMap.get(id)
            contactMap.delete(id)
            setContactMap(prev => {
                const prevMap = new Map(prev)
                prevMap.set(id, {...prevData, ...data})
                return prevMap
            })
        } else {
            setContacts({id, ...data})
            setContactMap(prev => {
                const prevMap = new Map(prev)
                prevMap.set(id, data)
                return prevMap
            })
        }

    }, [contactMap])
    const getContactInfo = useCallback((id) => {
        return contactMap.get(id)
    }, [contactMap])
    const setContactInfo = useCallback((id, data = {}) => {
        // console.log(id, data)
        setContactMap(prev => {
            const newMap = new Map(prev)
            if (newMap.has(id)) {
                newMap.set(id, {...newMap.get(id), ...data})
            } else {
                newMap.set(id, data)
            }
            return newMap
        })
    }, [])
    useEffect(() => {
        console.log(contactMap)
    }, [contactMap])
    useEffect(() => {
        if (userInfo) {
            getContacts()
        }
    }, [userInfo, getContacts])

    return (
        <contactsContext.Provider value={{selectedContact, setSelectedContact, contacts, setContactInfo, addContact, getContactInfo, contactMap}}>
            {children}
        </contactsContext.Provider>
    )
}
export default ContactsProvider
ContactsProvider.propTypes = {
    children: PropTypes.node.isRequired
}


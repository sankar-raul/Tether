import { useCallback, useEffect, useState } from "react"
import { contactsContext } from "./contact"
import PropTypes from 'prop-types'
import useUserInfo from "../userInfo/userInfo"
import apiRequest from '../../hook/apiRequest'

let contactRef = new Map()

const ContactsProvider = ({children}) => {
    const [ selectedContact, setSelectedContact ] = useState(null)
    const { userInfo } = useUserInfo()
    const [ contactMap, setContactMap ] = useState(new Map())
    const [ isContactFetched, setIsContactFetched ] = useState(false)
    const [ isLoading, setIsLoading ] = useState(false)

    const fetchContactInfo = useCallback(async (id) => {
        if (!userInfo || !id || contactRef.get(userInfo.id)?.username) return
        id = Number(id)
        const [response, error] = await apiRequest(`/chat/c/${id}`)
        if (!error) {
            if (!response) return
            const { data } = response
            if (contactRef.has(id)) {
                contactRef.set(id, {...contactRef.get(id), ...data})
            } else {
                contactRef.set(id, data)
            }
            setContactMap(new Map(contactRef))
        } else {
            console.log("/chat/c/:id Error at /src/context/contacts/provider.jsx". error)
        }
    }, [userInfo])

    const getContacts = useCallback(async () => {
        setIsContactFetched(true)
        // call api to get first 20 contacts with recent message
        setIsLoading(true)
        const [ response, error ] = await apiRequest('/chat/contacts')
        setIsLoading(false)
        if (!error) {
            // console.log(response?.data)
            if (response) {
                response.data.forEach(contact => {
                    contactRef.set(Number(contact.id), contact)
                    fetchContactInfo(contact.id)
                })
                setContactMap(new Map(contactRef))
            }
            // setContacts(response?.data)
        }
    }, [fetchContactInfo])

    const updateContactInfo = useCallback((id, data = {}) => {
        id = Number(id)
        // console.log(id, data)
        if (contactRef.has(id)) {
            contactRef.set(id, {...contactRef.get(id), ...data, id})
        } else {
            contactRef.set(id, {...data. id})
        }
        setContactMap(new Map(contactRef))
    }, [])

    // add contact and bring the contact to top in contact list
    const shiftUpContact = useCallback((id, data = {}) => {
        if (!id) return
        id = Number(id)
        if (contactRef.has(id)) {
            const newOrder = new Map()
            newOrder.set(id, {...contactRef.get(id), ...data, id, last_msg_at: data.sent_at})
            contactRef.delete(id)
            contactRef.forEach((value, key) => {
                newOrder.set(key, value)
            })
            contactRef = new Map(newOrder)
            // console.log(contactRef.get(id))
            setContactMap(new Map(contactRef))
        } else {
            const newOrder = new Map()
            newOrder.set(id, {...data, id, last_msg_at: data.sent_at})
            contactRef.forEach((value, key) => {
                newOrder.set(key, value)
            })
            fetchContactInfo(id)
            contactRef = new Map(newOrder)
            setContactMap(new Map(contactRef))
        }

    }, [fetchContactInfo])
    const getContactInfo = useCallback((id) => {
        return contactMap.get(id)
    }, [contactMap])

    useEffect(() => {
        // console.log(contactMap)
    }, [contactMap])

    useEffect(() => {
        if (userInfo) {
            !isContactFetched && getContacts()
        }
    }, [userInfo, getContacts, isContactFetched, updateContactInfo])

    return (
        <contactsContext.Provider value={{selectedContact, setSelectedContact, shiftUpContact, getContactInfo, contactMap, updateContactInfo, isLoading}}>
            {children}
        </contactsContext.Provider>
    )
}
export default ContactsProvider
ContactsProvider.propTypes = {
    children: PropTypes.node.isRequired
}


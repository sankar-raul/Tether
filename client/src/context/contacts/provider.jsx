import { useCallback, useEffect, useState } from "react"
import { contactsContext } from "./contact"
import PropTypes from 'prop-types'
import useUserInfo from "../userInfo/userInfo"
import apiRequest from '../../hook/apiRequest'
import socket from "../../utils/chatSocket"

let contactRef = new Map()

const ContactsProvider = ({children}) => {
    const [ selectedContact, setSelectedContact ] = useState(null)
    const { userInfo } = useUserInfo()
    const [ contactMap, setContactMap ] = useState(new Map())
    const [ isContactFetched, setIsContactFetched ] = useState(false)
    const [ isLoading, setIsLoading ] = useState(true)
    const [ isOpenSearch, setIsOpenSearch ] = useState(false)

    const fetchContactInfo = useCallback(async (id) => {
        if ( !id || contactRef.get(id)?.username) return
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
    }, [])

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
                    contactRef.set(Number(contact.contact_id), { id: contact.contact_id, content: contact.last_message, type: contact.type, latest_msg: contact.last_interaction_time, unread: contact.unread, isOnline: contact.isOnline })
                    fetchContactInfo(contact.contact_id)
                })
                setContactMap(new Map(contactRef))
            }
            // setContacts(response?.data)
        }
    }, [fetchContactInfo])

    const updateContactInfo = useCallback((id, data = {}, {newEntry = true}={}) => {
        id = Number(id)
        console.log(id, data, newEntry)
        if (contactRef.has(id)) {
            contactRef.set(id, {...contactRef.get(id), ...data, id})
        } else {
            newEntry && contactRef.set(id, {...data, id})
            // console.log(contactRef)
        }
        setContactMap(new Map(contactRef))
    }, [])

    // add contact and bring the contact to top in contact list
    const shiftUpContact = useCallback((id, data = {}) => {
        if (!id) return
        id = Number(id)
        if (contactRef.has(id)) {
            const newOrder = new Map()
            newOrder.set(id, {...contactRef.get(id), ...data, id, latest_msg: data.sent_at || ''})
            contactRef.delete(id)
            contactRef.forEach((value, key) => {
                newOrder.set(key, value)
            })
            contactRef = new Map(newOrder)
            // console.log(contactRef.get(id))
            setContactMap(new Map(contactRef))
        } else {
            const newOrder = new Map()
            // alert(data)
            newOrder.set(id, {...data, id, last_msg_at: data.sent_at || ''})
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
        if (userInfo) {
            !isContactFetched && getContacts()
        }
    }, [userInfo, getContacts, isContactFetched, updateContactInfo])

    useEffect(() => {
        const contactStatusChanged = ({user_id, isOnline, isTyping, ...args}) => {
            updateContactInfo(user_id, { isOnline, isTyping }, {
                newEntry: false
            })
            console.log(user_id, isOnline, isTyping, 'op')
        }
        socket.on('contact_status', contactStatusChanged)

        return () => socket.off('contact_status')
    }, [updateContactInfo])

    return (
        <contactsContext.Provider value={{selectedContact, setSelectedContact, shiftUpContact, getContactInfo, contactMap, updateContactInfo, isLoading, fetchContactInfo, setIsOpenSearch, isOpenSearch}}>
            {children}
        </contactsContext.Provider>
    )
}
export default ContactsProvider
ContactsProvider.propTypes = {
    children: PropTypes.node.isRequired
}


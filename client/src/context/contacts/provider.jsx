import { useCallback, useEffect, useState } from "react"
import { contactsContext } from "./contact"
import PropTypes from 'prop-types'
import useUserInfo from "../userInfo/userInfo"
import apiRequest from '../../hook/apiRequest'

const ContactsProvider = ({children}) => {
    const [ selectedContact, setSelectedContact ] = useState(null)
    const { userInfo } = useUserInfo()
    const [ contacts, setContacts ] = useState()


    const getContacts = useCallback(async () => {
        // call api to get first 20 contacts with recent message
        const [ response, error ] = await apiRequest('/chat/contacts')
        if (!error) {
            // console.log(response?.data)
            setContacts(response?.data)
        }
        // console.log(response.data)
    }, [])
    useEffect(() => {
        if (userInfo) {
            getContacts()
        }
    }, [userInfo, getContacts])
    return (
        <contactsContext.Provider value={{selectedContact, setSelectedContact, contacts}}>
            {children}
        </contactsContext.Provider>
    )
}
export default ContactsProvider
ContactsProvider.propTypes = {
    children: PropTypes.node.isRequired
}


import { useCallback, useEffect, useState } from "react"
import { contactsContext } from "./contact"
import PropTypes from 'prop-types'
import useUserInfo from "../userInfo/userInfo"
const users = [
    {
        id: 1,
        name: "Sankar"
    },
    {
        id: 2,
        name: "Sohan"
    },
    {
        id: 3,
        name: "Debanjan"
    },
    {
        id: 4,
        name: "Rahaman"
    },
    {
        id: 5,
        name: "Sankar"
    },
    {
        id: 6,
        name: "Sohan"
    },
    {
        id: 7,
        name: "Debanjan"
    },
    {
        id: 8,
        name: "Rahaman"
    },
    {
        id: 9,
        name: "Sankar"
    },
    {
        id: 10,
        name: "Sohan Naskar"
    },
    {
        id: 11,
        name: "Debanjan"
    },
    {
        id: 12,
        name: "Rahaman"
    },
    {
        id: 13,
        name: "Sankar"
    },
    {
        id: 14,
        name: "Sohan"
    },
    {
        id: 15,
        name: "Debanjan"
    },
    {
        id: 16,
        name: "Rahaman"
    },
]
const ContactsProvider = ({children}) => {
    const [ selectedContact, setSelectedContact ] = useState(null)
    const { userInfo } = useUserInfo()
    const [ contacts, setContacts ] = useState()

    const getContacts = useCallback(() => {
        // call api to get first 20 contacts with recent message
        setContacts(users)
    }, [])
    useEffect(() => {
        getContacts()
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


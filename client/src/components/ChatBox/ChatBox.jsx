import { useEffect, useState } from 'react'
import useContacts from '../../context/contacts/contact'
import styles from './chatbox.module.css'
import useMessages from '../../context/messages/messages'


const ChatBox = () => {
    const { selectedContact, getContactInfo } = useContacts()
    const [ chatingWith, setChatingWith ] = useState(getContactInfo(selectedContact) || {})
    const { getMessages } = useMessages()
    const [ msgs, setMsgs ] = useState([])
    useEffect(() => {
        setChatingWith(getContactInfo(selectedContact) ?? {})
        getMessages(selectedContact).then(data => setMsgs(data))
    }, [selectedContact, getContactInfo, getMessages])
    return (
            <section className={styles['chat-box']}>
                <h1>Chatting with {chatingWith.username}</h1>
                {msgs?.reverse().map((item, idx) => (
                    <h6 key={idx}>{item.content}</h6>
                ))}
            </section>
    )
}

export default ChatBox
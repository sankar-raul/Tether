import useContacts from '../../context/contacts/contact'
import styles from './chatbox.module.css'


const ChatBox = () => {
    const { selectedContact, contact } = useContacts()
    return (
        <section className={styles['chat-box']}>
            <h1>Chatting with {selectedContact}</h1>
        </section>
    )
}

export default ChatBox
import useContacts from '../../context/contacts/contact'
import styles from './chatbox.module.css'


const ChatBox = () => {
    const { currentContact, contact } = useContacts()

    return (
        <section className={styles['chat-box']}>
            <h1>Chatting with {contact}</h1>
        </section>
    )
}

export default ChatBox
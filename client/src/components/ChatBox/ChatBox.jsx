import { useEffect, useState } from 'react'
import useContacts from '../../context/contacts/contact'
import styles from './chatbox.module.css'
import useMsgSocket from '../../hook/useMsgSocket'

const ChatBox = () => {
    const { selectedContact, getContactInfo } = useContacts()
    const [ chatingWith, setChatingWith ] = useState(getContactInfo(selectedContact) || {})
    const { messages, seenMap, sendMsg, seeMsg } = useMsgSocket(Number(selectedContact))
    const [ text, setText ] = useState('')
    const [ chats, setChats ] = useState([])
    const handleInput = (e) => {
        setText(e.target.value)
    }
    const send = () => {
        const messageContent = text.trim()
        if (messageContent.length > 0) {
            setText('')
            sendMsg(messageContent)
        }
    }
    useEffect(() => {
        const chat = []
        messages.get(Number(selectedContact))?.forEach((item) => {
            chat.push(item)
        })
        setChats(chat)
        console.log(messages)
        console.log(chat)
    }, [messages, selectedContact, seeMsg])
    useEffect(() => {
        if (!chatingWith || !chatingWith.unread) return
        if (chatingWith.unread > 0) {
            seeMsg(chatingWith.id)
        }
    }, [messages, chatingWith, seeMsg])
    useEffect(() => {
        setChatingWith(getContactInfo(selectedContact) ?? {})
    }, [selectedContact, getContactInfo])
    return (
            <section className={styles['chat-box']}>
                <h1>Chatting with {chatingWith.username}</h1>
              {
                chats.map(msg => <h6 key={msg.id} name={msg.id}>{msg.content}</h6>)
              }
              <input onChange={handleInput} type="text" value={text} />
              <button onClick={send}>Send</button>
            </section>
    )
}

export default ChatBox
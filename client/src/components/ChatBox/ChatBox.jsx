import { useEffect, useRef, useState } from 'react'
import useContacts from '../../context/contacts/contact'
import styles from './chatbox.module.css'
import useMsgSocket from '../../hook/useMsgSocket'
import chatNavStyle from './chatNav.module.css'
const ChatBox = () => {
    const { selectedContact, getContactInfo } = useContacts()
    const [ chatingWith, setChatingWith ] = useState(getContactInfo(selectedContact) || {})
    const { messages, sendMsg, seeMsg } = useMsgSocket(Number(selectedContact))
    const [ text, setText ] = useState('')
    const [ chats, setChats ] = useState([])
    const scrollRef = useRef(null)

    const handleInput = (e) => {
        setText(e.target.value)
    }
    const send = () => {
        scrollRef.current.scrollIntoView()
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
    }, [messages, selectedContact, seeMsg, chatingWith])

    useEffect(() => {
        if (!chatingWith || !chatingWith.unread) return
        if (chatingWith.unread > 0) {
            seeMsg(chatingWith.id)
        }
    }, [messages, chatingWith, seeMsg])
    useEffect(() => {
        setChatingWith(getContactInfo(selectedContact) ?? {})
    }, [selectedContact, getContactInfo])

    useEffect(() => {
        if (!scrollRef.current) return
        scrollRef.current.scrollIntoView()
    }, [scrollRef, selectedContact])
    return (
        <>
        {selectedContact != null && selectedContact != 0 ?
            <section className={styles['chat-box']}>
                <ChatContactHeader />
                {/* <h1>Chatting with {chatingWith.username}</h1> */}
              <main className={styles['msgs']}>
                <div ref={scrollRef} className={styles['scroll']}>scroll</div>
              {
                chats.slice().reverse().map(msg =>
                <div key={msg.id}>
                    <span name={msg.id} style={msg.sender == chatingWith.id ? {float: 'left'} : {float: 'right'}}>{msg.content}</span>
                </div>
                )
              }
              </main>
              <div className={styles['msg-send-bar']}>
                <input onChange={handleInput} type="text" value={text} />
                <button onClick={send}>Send</button>
              </div>
            </section>
            : <section>Please select a contact</section>
}
        </>
    )
}

const ChatContactHeader = () => {
    
    return (
        <nav className={chatNavStyle['chat-nav']}>
header
        </nav>
    )
}
export default ChatBox
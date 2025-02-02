import { useEffect, useRef, useState } from 'react'
import useContacts from '../../context/contacts/contact'
import styles from './chatbox.module.css'
import useMsgSocket from '../../hook/useMsgSocket'
import chatNavStyle from './chatNav.module.css'
import PropTypes from 'prop-types'
import videoIcon from '../../assets/svg/chat/video.svg'
import callIcon from '../../assets/svg/chat/call-fff.svg'
import messageSearchIcon from '../../assets/svg/chat/message-search.svg'
import dotsIcon from '../../assets/svg/chat/dots.svg'


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
                <div ref={scrollRef} className={styles['scroll']}>&nbsp;</div>
              {
                chats.slice().reverse().map(msg =>
                <div className={`${styles['message-tag']} ${msg.reciver != chatingWith.id ? styles['not-me'] : styles['me']}`} key={msg.id}>
                    <div name={msg.id}>
                        <span className={styles['message-text']}>{msg.content}</span>
                    </div>
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
            <div className={chatNavStyle['user-info']}>
                <div className={chatNavStyle['user-dp']}>
                    <img className={chatNavStyle['dp-image']} onLoad={(e) => e.target.style.display = 'block'} src='/me.jpg' alt="" />
                </div>
                <div className={chatNavStyle['user-wraper']}>
                    <div className={chatNavStyle['username']}>Sankar</div>
                    <div className={chatNavStyle["user-status"]}>online</div>
                </div>
            </div>
            <div className={chatNavStyle['nav-buttons']}>
                <NavBtn src={videoIcon} />
                <NavBtn src={callIcon} />
                <NavBtn src={dotsIcon} />
            </div>
        </nav>
    )
}
const NavBtn = ({src}) => {

    return (
        <div className={chatNavStyle['nav-btn']}>
            <img src={src} alt="" />
        </div>
    )
}
NavBtn.propTypes = {
    src: PropTypes.string.isRequired
}
export default ChatBox
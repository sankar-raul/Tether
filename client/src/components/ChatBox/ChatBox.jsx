import { useCallback, useEffect, useRef, useState } from 'react'
import useContacts from '../../context/contacts/contact'
import styles from './chatbox.module.css'
import useMsgSocket from '../../hook/useMsgSocket'
import chatNavStyle from './chatNav.module.css'
import PropTypes from 'prop-types'
import videoIcon from '../../assets/svg/chat/video.svg'
import callIcon from '../../assets/svg/chat/call-fff.svg'
// import messageSearchIcon from '../../assets/svg/chat/message-search.svg'
import dotsIcon from '../../assets/svg/chat/dots.svg'
import singleTickIcon from '../../assets/svg/chat/single-tick.svg'
import doubleTickIcon from '../../assets/svg/chat/double-tick.svg'
import blueTickIcon from '../../assets/svg/chat/blue-tick.svg'
import pendingTickIcon from '../../assets/svg/chat/pending.svg'
import { HeroDate } from '../../utils/date'


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
        // console.log(messages)
        // console.log(chat)
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
                <ChatContactHeader user={chatingWith}/>
                {/* <h1>Chatting with {chatingWith.username}</h1> */}
              <main className={styles['msgs']}>
                <div ref={scrollRef} className={styles['scroll']}>&nbsp;</div>
              {
                chats.slice().reverse().map(msg =>
                    <MessageTag key={msg.id} msg={msg} chatingWith={chatingWith} />
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
const MessageTag = ({msg, chatingWith}) => {
    const [ tickImg, setTickImg ] = useState(singleTickIcon)
    const [ msgTime, setMsgTime ] = useState('')
    const getFormatedTime = useCallback((dateString) => {
        const date = new HeroDate(dateString)
        return date.formatedTime()
    }, [])

    useEffect(() => {
        if (msg.seen_at) {
            setTickImg(blueTickIcon)
        } else if (msg.recived_at) {
            setTickImg(doubleTickIcon)
        } else if (msg.sent_at) {
            setTickImg(singleTickIcon)
        } else {
            setTickImg(pendingTickIcon)
        }
        if (msg.sent_at) {
            setMsgTime(getFormatedTime(msg.sent_at))
        }
    }, [msg, getFormatedTime])
    return (
        <div className={`${styles['message-tag']} ${msg.reciver != chatingWith.id ? styles['not-me'] : styles['me']}`} key={msg.id}>
            <div className={styles['message-body']}>
                <div className={styles['content']} name={msg.id}>
                    <span className={styles['message-text']}>{msg.content}</span>
                </div>
                <div className={styles['message-status']}>
                    <div>{msgTime}</div>
                    {msg.reciver == chatingWith.id ? (<div className={styles['tick']}>
                        <img src={tickImg} alt="status" />
                    </div>)
                    : ''}
                </div>
            </div>
        </div>
    )
}
MessageTag.propTypes = {
    msg: PropTypes.object.isRequired,
    chatingWith: PropTypes.object.isRequired
}
const ChatContactHeader = ({ user }) => {
    
    return (
        <nav className={chatNavStyle['chat-nav']}>
            <div className={chatNavStyle['user-info']}>
                <div className={chatNavStyle['user-dp']}>
                    <img className={chatNavStyle['dp-image']} onLoad={(e) => e.target.style.display = 'block'} src='/me.jpg' alt="" />
                </div>
                <div className={chatNavStyle['user-wraper']}>
                    <div className={chatNavStyle['username']}>{user.username || 'username'}</div>
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
ChatContactHeader.propTypes = {
    user: PropTypes.object
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
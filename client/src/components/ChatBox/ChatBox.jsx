import { useCallback, useEffect, useRef, useState } from 'react'
import useContacts from '../../context/contacts/contact'
import styles from './chatbox.module.css'
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
import ChatInput from '../ChatInput/ChatInput'
import useChat from '../../context/chatSocket/chatSocket'
import { DefaultUser } from '../DefaultUser/DefaultUser'


const ChatBox = () => {
    const { selectedContact, getContactInfo } = useContacts()
    const [ chatingWith, setChatingWith ] = useState(getContactInfo(selectedContact) || {})
    const { messages, seeMsg } = useChat()
    const [ chats, setChats ] = useState([])
    const scrollRef = useRef(null)

    
    useEffect(() => {
        const chat = []
        messages.get(Number(selectedContact))?.forEach((item, key) => {
            chat.push({...item, key})
        })
        console.log(messages)
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
            <section className={styles['chat-box']}>
            {selectedContact != null && selectedContact != 0 ?
            <>
                <ChatContactHeader user={chatingWith} />
                <main className={styles['msgs']}>
                <div ref={scrollRef} className={styles['scroll']}>&nbsp;</div>
                {
                    chats.slice().reverse().map(msg =>
                        <MessageTag key={msg.key} msg={msg} chatingWith={chatingWith} />
                    )
                }
                </main>
                <ChatInput scrollRef={scrollRef}/>
            </>
            : <section>Please select a contact</section>
            }
            </section>
        </>
    )
}
const MessageTag = ({msg, chatingWith}) => {
    const [ tickImg, setTickImg ] = useState(singleTickIcon)
    const [ msgTime, setMsgTime ] = useState('')
    const [ rightClick, setRightClick ] = useState()
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
            if (msg.tick == 0)
                setTickImg(pendingTickIcon)
            else
                setTickImg(singleTickIcon)
        }
        if (msg.sent_at) {
            setMsgTime(getFormatedTime(msg.sent_at))
        }
    }, [msg, getFormatedTime])
    return (
        <div className={`${styles['message-tag']} ${msg.reciver != chatingWith.id ? styles['not-me'] : styles['me']}`} key={msg.id}>
            <div className={styles['message-body']} onContextMenu={setRightClick}>
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
            <MsgContextMenu msg_id={msg?.id} chatingWith={chatingWith?.id} content={msg.content} rightClick={rightClick}/>
        </div>
    )
}
MessageTag.propTypes = {
    msg: PropTypes.object.isRequired,
    chatingWith: PropTypes.object.isRequired
}

const MsgContextMenu = ({msg_id, chatingWith, content, rightClick}) => {
    const [ menuDisplay, setMenuDisplay ] = useState('none')
    const [ mousePositions, setMousePositions ] = useState({})
    const [ menuPositions, setMenuPositions ] = useState({})
    const { deleteMsg } = useChat()

    const menuRef = useRef(null)
    const handleDisplay = useCallback((isShow, e) => {
        console.log(isShow)
        setMenuDisplay(isShow ? 'block' : 'none')
        if (isShow) {
            console.log(e.clientX, e.clientY)
            setMousePositions({x: e.clientX, y: e.clientY})
        }
    }, [])
    useEffect(() => {
        if (rightClick) {
            rightClick.preventDefault()
            handleDisplay(true, rightClick)
        }
    }, [rightClick, handleDisplay])
    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(content)
    }, [content])

    useEffect(() => {
        if (menuDisplay == 'block') {
            const { offsetWidth:menuWidth, offsetHeight:menuHeight } = menuRef.current
            console.log(menuRef)
            setMenuPositions({top: mousePositions.y, left: mousePositions.x - menuWidth})
        }
    }, [menuDisplay, mousePositions])

    return (
        <>
            <div className={styles['msg-context-menu']}>
                <div onClick={(e) => handleDisplay(true, e)} className={styles['context-icon-wraper']}>
                    <img className={styles['context-menu-icon']} src={dotsIcon} alt="context menu" />
                </div>
            </div>
            <div onContextMenu={(e) => e.preventDefault()} onClick={() => handleDisplay(false)} style={{display: menuDisplay}} className={styles['main-context-menu']}>
                <div ref={menuRef} style={{marginTop: `${menuPositions.top}px`, marginLeft: `${menuPositions.left}px`}} className={styles['menu']}>
                    <div onClick={handleCopy}>
                        <p>Copy</p>
                    </div>
                    <div>
                        <p>Edit</p>
                    </div>
                    <div onClick={() => deleteMsg(chatingWith, msg_id)}>
                        <p>Delete</p>
                    </div>
                </div>
            </div>
        </>
    )
}
MsgContextMenu.propTypes = {
    msg_id: PropTypes.number,
    chatingWith: PropTypes.number,
    content: PropTypes.string,
    rightClick: PropTypes.object
}
const ChatContactHeader = ({ user }) => {
    
    return (
        <nav className={chatNavStyle['chat-nav']}>
            <div className={chatNavStyle['user-info']}>
                <div className={chatNavStyle['user-dp']}>
                {
                 user.profile_pic_url ? <img className={chatNavStyle['dp-image']} onLoad={(e) => e.target.style.display = 'block'} src={user.profile_pic_url} alt={user.username} /> : <DefaultUser />
                }
                </div>
                <div className={chatNavStyle['user-wraper']}>
                    <div className={chatNavStyle['username']}>{user.username || ''}</div>
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
import { useCallback, useEffect, useRef, useState } from 'react'
import useContacts from '../../context/contacts/contact'
import styles from './chatbox.module.css'
import PropTypes from 'prop-types'
import singleTickIcon from '../../assets/svg/chat/single-tick.svg'
import doubleTickIcon from '../../assets/svg/chat/double-tick.svg'
import blueTickIcon from '../../assets/svg/chat/blue-tick.svg'
import pendingTickIcon from '../../assets/svg/chat/pending.svg'
import { HeroDate } from '../../utils/date'
import ChatInput from '../ChatInput/ChatInput'
import useChat from '../../context/chatSocket/chatSocket'
import { Loader } from '../Loader/Loader'
import useIntersectionObserver from '../../hook/useIntersectionObserver'
import DefaultChatView from './DefaultView/DefaultView'
import { useMediaQuery } from 'react-responsive'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons'
import ChatContactHeader from './ChatContactHeader/chatContactHeader'
import { faCopy, faPenToSquare, faTrashCan } from '@fortawesome/free-regular-svg-icons'

const ChatBox = () => {
    const { selectedContact, getContactInfo } = useContacts()
    const [ chatingWith, setChatingWith ] = useState(getContactInfo(selectedContact) || {})
    const { messages, seeMsg, isLoading, nextMsgChunk } = useChat()
    const [ chats, setChats ] = useState([])
    const scrollRef = useRef(null)
    const [ nextChunk, setNextChunk ] = useState(null)
    const isMobile = useMediaQuery({ query: '(max-width: 700px)' })
    
    useEffect(() => {
        const chat = []
        messages.get(Number(selectedContact))?.forEach((item, key) => {
            chat.push({...item, key})
            // console.log(item, key)
        })
        // console.log(messages)
        setChats(chat)
        // console.log(messages)
        // console.log(chat)
    }, [messages, selectedContact, chatingWith])

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
        setNextChunk(nextMsgChunk.get(selectedContact))
    }, [selectedContact, nextMsgChunk])

    useEffect(() => {
        if (!scrollRef.current) return
        if (!isMobile)
            scrollRef.current.scrollIntoView()
        else
            scrollRef.current.scrollIntoView()
        
    }, [scrollRef, selectedContact, isMobile])
    return (
        <>
            <section className={styles[`chat-container`]}>
            {selectedContact != null && selectedContact != 0 ?
            <>
            <div className={styles['chat-box']}>
                <ChatContactHeader user={chatingWith} />
                <main className={styles['msgs']}>
                <div ref={scrollRef} className={styles['scroll']}>&nbsp;</div>
                {
                    isLoading.for != chatingWith.id || isLoading.state == false ? 
                    ( 
                    <>
                        {
                            chats.slice().reverse().map((msg) =>
                                <MessageTag key={msg.key} msg={msg} chatingWith={chatingWith} />
                            )
                        }
                         {
                            nextChunk ? <LoadMoreMsgLoader contact_id={Number(selectedContact)}/> : ''
                        }
                       
                    </>
                    ) : <Loader type='msgLoaderSkeleton' />
                }
                </main>
                <ChatInput scrollRef={scrollRef}/>
            </div>
            </>
            : <DefaultChatView />
            }
            </section>
        </>
    )
}

const LoadMoreMsgLoader = ({contact_id}) => {
    const [ ref, isVisible ] = useIntersectionObserver({threshold: .1})
    const { loadMoreMsg } = useChat()

    useEffect(() => {
        // isVisible && loadMoreMsg({id: contact_id})
    }, [isVisible, loadMoreMsg, contact_id])

    return (
        <div ref={ref}>
            <Loader type="msgLoaderSkeleton" />
        </div>
    )
}
LoadMoreMsgLoader.propTypes = {
    contact_id: PropTypes.number.isRequired
}

const MessageTag = ({msg, chatingWith}) => {
    const [ tickImg, setTickImg ] = useState(singleTickIcon)
    const [ msgTime, setMsgTime ] = useState('')
    const [ rightClick, setRightClick ] = useState()
    // const { useInfo: { my_id } } = useUserInfo()
    const getFormatedTime = useCallback((dateString) => {
        const date = new HeroDate(dateString)
        return date.formatedTime()
    }, [])

    useEffect(() => {
        if (!msg.seen_at) {
            // console.log(msg)
        }
        if (msg.seen_at) {
            // console.log(msg)
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
            <MsgContextMenu msg_id={msg?.id} chatingWith={chatingWith?.id} content={msg.content} rightClick={rightClick} />
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
        // console.log(isShow)
        setMenuDisplay(isShow ? 'block' : 'none')
        if (isShow) {
            // console.log(e.clientX, e.clientY)
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
            const viewportHeight = top.innerHeight
            const isVisible = viewportHeight - (mousePositions.y + menuHeight) >= 10
            // console.log(viewportHeight - (mousePositions.y + menuHeight), ' dfdfedfef', viewportHeight, top.innerHeight)
            setMenuPositions(_ => {
                if (isVisible) {
                    return {top: mousePositions.y, left: mousePositions.x - menuWidth}
                } else {
                    return {top: mousePositions.y - menuHeight, left: mousePositions.x - menuWidth}
                }
            })
        }
    }, [menuDisplay, mousePositions])

    return (
        <>
            <div className={styles['msg-context-menu']}>
                <div onClick={(e) => handleDisplay(true, e)} className={styles['context-icon-wraper']}>
                    {/* <img className={styles['context-menu-icon']} src={dotsIcon} alt="context menu" /> */}
                    <FontAwesomeIcon className={styles['context-menu-icon']} icon={faEllipsisVertical} />
                </div>
            </div>
            <div onContextMenu={(e) => e.preventDefault()} onClick={() => handleDisplay(false)} style={{display: menuDisplay}} className={styles['main-context-menu']}>
                <div ref={menuRef} style={{marginTop: `${menuPositions.top}px`, marginLeft: `${menuPositions.left}px`}} className={styles['menu']}>
                    <div onClick={handleCopy}>
                        <FontAwesomeIcon icon={faCopy} />
                        <p>Copy</p>
                    </div>
                    <div>
                        <FontAwesomeIcon icon={faPenToSquare} />
                        <p>Edit</p>
                    </div>
                    <div onClick={() => deleteMsg(chatingWith, msg_id)}>
                        <FontAwesomeIcon icon={faTrashCan} />
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

export default ChatBox
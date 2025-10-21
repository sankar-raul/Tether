import videoIcon from '../../../assets/svg/chat/video.svg'
import callIcon from '../../../assets/svg/chat/call-fff.svg'
// import messageSearchIcon from '../../assets/svg/chat/message-search.svg'
import dotsIcon from '../../../assets/svg/chat/dots.svg'
import { DefaultUser } from '../../DefaultUser/DefaultUser'
import { useMediaQuery } from 'react-responsive'
import useContacts from '../../../context/contacts/contact'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import styles from './chat-contact-header.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAdd, faCancel, faChevronLeft, faTrashAlt, faUser, faX, faXmark, faXmarkCircle } from '@fortawesome/free-solid-svg-icons'
// import { useConfirm } from '../../../hook/Confirm/useConfirm'
import useConfirm from '../../../context/confirm/confirm.context'
import useUserInfo from '../../../context/userInfo/userInfo'
import useCall from '../../../context/call/call.context'
import { createPortal } from 'react-dom'


const ChatContactHeader = ({ user, headerRef, chatBoxRef }) => {
    const isMobile = useMediaQuery({ query: '(max-width: 700px)' })
    const { setSelectedContact } = useContacts()
    const [ isShowMenu, setIsShowMenu ] = useState(false)
    const [ isChatingWithMyself, setIsChatingWithMyself ] = useState(false)
    const { userInfo:myInfo } = useUserInfo()
    const { startCall } = useCall()
    // const navigate = useSmartNavigate()

    const startTethering = useCallback((type) => {
        setSelectedContact(0)
        startCall({
            contact_id: user?.id,
            contact_info: user,
            type: type
        })
    }, [startCall, user, setSelectedContact])

    const closeChat = useCallback(() => {
        if (isMobile) {
            setSelectedContact(0)
        }
    }, [setSelectedContact, isMobile])
    
    const handleMoreMenu = useCallback((e) => {
        e?.stopPropagation()
        setIsShowMenu(prev => !prev)
    }, [])

    useEffect(() => {
        const closeMenu = () => {
            setIsShowMenu(false)
        }
        if (isShowMenu) {
            document.addEventListener('click', closeMenu)
            return () => document.removeEventListener('click', closeMenu)
        }
    }, [isShowMenu])
    useEffect(() => {
        setIsChatingWithMyself(user?.id == myInfo?.id)
    }, [user, myInfo])

    return (
        <nav className={styles['chat-nav']} ref={headerRef}>
            <div className={styles['user-info']}>
                {isMobile ? <div onClick={closeChat} className={styles['back-btn']}><FontAwesomeIcon icon={faChevronLeft} fontSize={22}/></div> : '' }
                <div className={styles['user-dp']}>
                {
                 user.profile_pic_url ? <img className={styles['dp-image']} onLoad={(e) => e.target.style.display = 'block'} src={user.profile_pic_url} alt={user.username} /> : <DefaultUser />
                }
                {user.isOnline ? <div className={styles['user-online-tag']}></div> : ''}
                </div>
                <div className={styles['user-wraper']}>
                    <div className={styles['username']}>{user.username || ''} {user?.id == myInfo?.id ? ' (You)' : ''}</div>
                    <div className={styles["user-status"]}>{ user?.isTyping ? "typing..." : user?.isOnline ? 'online' : "offline"}</div>
                </div>
            </div>
            <div className={styles['nav-buttons']}>
                <NavBtn src={videoIcon} disabled={isChatingWithMyself} onClick={() => startTethering('video')}/>
                <NavBtn src={callIcon} disabled={isChatingWithMyself} onClick={() => startTethering('audio')}/>
                <NavBtn src={dotsIcon} onClick={handleMoreMenu} />
            </div>
            {isShowMenu ? <Menu setIsShowMenu={setIsShowMenu} chatBoxRef={chatBoxRef} /> : ''}
        </nav>
    )
}
ChatContactHeader.propTypes = {
    user: PropTypes.object,
    headerRef: PropTypes.object,
    chatBoxRef: PropTypes.object
}

const Menu = ({setIsShowMenu, chatBoxRef, ...props}) => {
    const { Confirm } = useConfirm()
    const [ interactedElement, setInteractedElement ] = useState(null)
    const [ isConfirmed, setIsConfirmed ] = useState(null)
    const handleCancel = useCallback(() => {
        setIsShowMenu(false)
    }, [setIsShowMenu])

    const handleAddContact = useCallback(() => {
        setIsShowMenu(false)
    }, [setIsShowMenu])

    const handleViewProfile = useCallback(() => {
        setIsShowMenu(false)
    }, [setIsShowMenu])

    const validActionsRef = useRef(new Map([['viewProfile', handleViewProfile],['clearChat', null], ['addContact', handleAddContact], ['block', null], ['cancel', handleCancel]]))

    const handleClick = useCallback((e) => {
        const action = e.target.dataset?.action
        e.stopPropagation()
        if (validActionsRef.current?.has(action)) {
            setInteractedElement(action)
            if (action == 'clearChat' || action == 'block') {
                (async ()=> {
                    setIsConfirmed(await Confirm())
                })()
            } else {
                validActionsRef.current.get(action)?.()
            }
        }
    }, [Confirm])

    useEffect(() => {
        isConfirmed != null ?  setIsShowMenu(false) : ''
    }, [isConfirmed, setIsShowMenu])
    return chatBoxRef.current ? createPortal(
        <div className={styles['menu']} {...props} onClick={handleClick}>
            <button data-action='viewProfile'>
                <div><FontAwesomeIcon icon={faUser} /></div>
                <p>View Profile</p>
            </button>
            <button data-action='addContact'>
                <div><FontAwesomeIcon icon={faAdd} /></div>
                <p>Add Contact</p>
            </button>
            <button data-action='clearChat'>
                <div><FontAwesomeIcon icon={faTrashAlt} /></div>
                <p>Clear Chat</p>
            </button>
            <button data-action='block' className={styles['block']}>
                <div><FontAwesomeIcon icon={faCancel} /></div>
                <p>Block</p>
            </button>
             <button data-action='cancel'>
                <div><FontAwesomeIcon icon={faXmark} /></div>
                <p>Dismiss</p>
            </button>
        </div>, chatBoxRef.current
    ) : ('')
}
Menu.propTypes = {
    setIsShowMenu: PropTypes.func.isRequired,
    chatBoxRef: PropTypes.object
}

const NavBtn = ({src, disabled, onClick, ...props}) => {

    const handleClick = useCallback((e) => {
        if (disabled) {
            return
        }
        typeof onClick == 'function' && onClick(e)
    }, [disabled, onClick])

    return (
        <div {...props} onClick={handleClick} className={`${styles['nav-btn']} ${disabled ? styles['disabled'] : ''}`}>
            <img src={src} alt="call button" />
        </div>
    )
}
NavBtn.propTypes = {
    src: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    onClick: PropTypes.func
}
export default memo(ChatContactHeader)
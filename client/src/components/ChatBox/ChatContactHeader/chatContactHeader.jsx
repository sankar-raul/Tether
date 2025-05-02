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
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import { useConfirm } from '../../../hook/Confirm/useConfirm'
import useUserInfo from '../../../context/userInfo/userInfo'


const ChatContactHeader = ({ user }) => {
    const isMobile = useMediaQuery({ query: '(max-width: 700px)' })
    const { setSelectedContact } = useContacts()
    const [ isShowMenu, setIsShowMenu ] = useState(false)
    const [ isChatingWithMyself, setIsChatingWithMyself ] = useState(false)
    const { userInfo:myInfo } = useUserInfo()

    const closeChat = useCallback(() => {
        isMobile && setSelectedContact(0)
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
        <nav className={styles['chat-nav']}>
            <div className={styles['user-info']}>
                {isMobile ? <div onClick={closeChat} className={styles['back-btn']}><FontAwesomeIcon icon={faChevronLeft} fontSize={22}/></div> : '' }
                <div className={styles['user-dp']}>
                {
                 user.profile_pic_url ? <img className={styles['dp-image']} onLoad={(e) => e.target.style.display = 'block'} src={user.profile_pic_url} alt={user.username} /> : <DefaultUser />
                }
                </div>
                <div className={styles['user-wraper']}>
                    <div className={styles['username']}>{user.username || ''} {user?.id == myInfo?.id ? ' (You)' : ''}</div>
                    <div className={styles["user-status"]}>online</div>
                </div>
            </div>
            <div className={styles['nav-buttons']}>
                <NavBtn src={videoIcon} disabled={isChatingWithMyself}/>
                <NavBtn src={callIcon} disabled={isChatingWithMyself} />
                <NavBtn src={dotsIcon} onClick={handleMoreMenu} />
            </div>
            {isShowMenu ? <Menu setIsShowMenu={setIsShowMenu} /> : ''}
        </nav>
    )
}
ChatContactHeader.propTypes = {
    user: PropTypes.object
}

const Menu = ({setIsShowMenu, ...props}) => {
    const { Confirm, isConfirmed, setIsShow } = useConfirm()
    const [ interactedElement, setInteractedElement ] = useState(null)

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
                setIsShow(true)
            } else {
                validActionsRef.current.get(action)?.()
            }
        }
    }, [setIsShow])

    useEffect(() => {
        isConfirmed != null ?  setIsShowMenu(false) : ''
    }, [isConfirmed, setIsShowMenu])
    return (
        <>
        <div className={styles['menu']} {...props} onClick={handleClick}>
            <button data-action='viewProfile'>View Profile</button>
            <button data-action='clearChat'>Clear Chat</button>
            <button data-action='addContact'>Add Contact</button>
            <button data-action='cancel'>Cancel</button>
            <button data-action='block' className={styles['block']}>Block</button>
        </div>
        <Confirm />
        </>
    )
}
Menu.propTypes = {
    setIsShowMenu: PropTypes.func.isRequired
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
            <img src={src} alt="" />
        </div>
    )
}
NavBtn.propTypes = {
    src: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    onClick: PropTypes.func
}
export default memo(ChatContactHeader)
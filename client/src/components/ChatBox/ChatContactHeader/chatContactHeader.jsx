import videoIcon from '../../../assets/svg/chat/video.svg'
import callIcon from '../../../assets/svg/chat/call-fff.svg'
// import messageSearchIcon from '../../assets/svg/chat/message-search.svg'
import dotsIcon from '../../../assets/svg/chat/dots.svg'
import { DefaultUser } from '../../DefaultUser/DefaultUser'
import { useMediaQuery } from 'react-responsive'
import useContacts from '../../../context/contacts/contact'
import { memo, useCallback, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import styles from './chat-contact-header.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import { useConfirm } from '../../../hook/Confirm/useConfirm'


const ChatContactHeader = ({ user }) => {
    const isMobile = useMediaQuery({ query: '(max-width: 700px)' })
    const { setSelectedContact } = useContacts()
    const [ isShowMenu, setIsShowMenu ] = useState(false)

    const closeChat = useCallback(() => {
        isMobile && setSelectedContact(0)
    }, [setSelectedContact, isMobile])

    const handleMoreMenu = useCallback((e) => {
        e.stopPropagation()
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
                    <div className={styles['username']}>{user.username || ''}</div>
                    <div className={styles["user-status"]}>online</div>
                </div>
            </div>
            <div className={styles['nav-buttons']}>
                <NavBtn src={videoIcon}/>
                <NavBtn src={callIcon} />
                <NavBtn src={dotsIcon} onClick={handleMoreMenu}/>
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

    const handleClick = useCallback((e) => {
        e.stopPropagation()
        setIsShow(true)
    }, [setIsShow])

    useEffect(() => {
        console.log(isConfirmed)
    }, [isConfirmed])
    return (
        <>
        <div className={styles['menu']} {...props} onClick={handleClick}>
            <button>View Profile</button>
            <button>Clear Chat</button>
            <button>Add Contact</button>
            <button className={styles['block']}>Block</button>
        </div>
        <Confirm />
        </>
    )
}
Menu.propTypes = {
    setIsShowMenu: PropTypes.func.isRequired
}

const NavBtn = ({src, ...props}) => {

    return (
        <div {...props} className={styles['nav-btn']}>
            <img src={src} alt="" />
        </div>
    )
}
NavBtn.propTypes = {
    src: PropTypes.string.isRequired
}
export default memo(ChatContactHeader)
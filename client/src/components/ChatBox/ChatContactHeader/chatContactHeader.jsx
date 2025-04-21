import videoIcon from '../../../assets/svg/chat/video.svg'
import callIcon from '../../../assets/svg/chat/call-fff.svg'
// import messageSearchIcon from '../../assets/svg/chat/message-search.svg'
import dotsIcon from '../../../assets/svg/chat/dots.svg'
import { DefaultUser } from '../../DefaultUser/DefaultUser'
import { useMediaQuery } from 'react-responsive'
import useContacts from '../../../context/contacts/contact'
import { memo, useCallback, useState } from 'react'
import PropTypes from 'prop-types'
import styles from './chat-contact-header.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'

const Menu = () => {

    return (
        <div>
            Menu
        </div>
    )
}

const ChatContactHeader = ({ user }) => {
    const isMobile = useMediaQuery({ query: '(max-width: 700px)' })
    const { setSelectedContact } = useContacts()
    const [ isShowMenu, setIsShowMenu ] = useState(false)

    const closeChat = useCallback(() => {
        isMobile && setSelectedContact(0)
    }, [setSelectedContact, isMobile])

    const handleMoreMenu = useCallback(() => {
        setIsShowMenu(prev => !prev)
    }, [])

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
                <NavBtn src={videoIcon} />
                <NavBtn src={callIcon} />
                <NavBtn src={dotsIcon} onClick={handleMoreMenu}/>
            </div>
            {isShowMenu ? <Menu /> : ''}
        </nav>
    )
}
ChatContactHeader.propTypes = {
    user: PropTypes.object
}


const NavBtn = ({src, ...props}) => {

    return (
        <div className={styles['nav-btn']} {...props}>
            <img src={src} alt="" />
        </div>
    )
}
NavBtn.propTypes = {
    src: PropTypes.string.isRequired
}
export default memo(ChatContactHeader)
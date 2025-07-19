import styles from './settings.module.css'
import editPen from '../../assets/svg/settings/edit_pen.svg'
import userIcon from '../../assets/svg/settings/user_icon.svg'
import notificationIcon from '../../assets/svg/settings/notification_icon.svg'
import themeIcon from '../../assets/svg/settings/theme_icon.svg'
import keyIcon from '../../assets/svg/settings/key_icon.svg'
import PropTypes from 'prop-types'
import useUserInfo from '../../context/userInfo/userInfo'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'
import useSwitch from '../../hook/Switch/useSwitch'
import useSmartNavigate from '../../hook/useSmartNavigate'
import { useCallback, useEffect, useState } from 'react'
import { DefaultUser } from '../DefaultUser/DefaultUser'
import { useConfirm } from '../../hook/Confirm/useConfirm'
// import socket from '../../utils/chatSocket'
// import apiRequest from '../../hook/apiRequest'
import useAlert from '../../context/alert/Alert'
import useAuth from '../../context/auth/auth.context'

const SettingsTab = () => {
    const { userInfo } = useUserInfo()
    const { Confirm, isConfirmed, setIsShow } = useConfirm()
    const [ isSigningOut, setIsSigningOut ] = useState(false)
    const { Alert } = useAlert()
    const navigate = useSmartNavigate()
    const { logout:_logout } = useUserInfo()
    const { logout } = useAuth()
    const handleLogout = () => {
        setIsShow(true)
    }
    useEffect(() => {
        if (isConfirmed) {
            setIsSigningOut(true)
            ;(async () => {
                const [ logoutResponse, error ] = await logout()
                if (error) {
                    Alert({message: "Something went wrong!", type:'error'})
                    setIsSigningOut(false)
                } else {
                    setIsSigningOut(false)
                    _logout()
                    logoutResponse?.success && navigate('/login')
                    Alert({message: "Logged out", type:'info'})
                }
            })()
        }
    }, [isConfirmed])

    useEffect(() => {
        console.log(isSigningOut)
    }, [isSigningOut])

    return (
        <>
        <section className={styles['settings-tab-container']}>
            <div className={`${styles["signing-out-banner"]} ${isSigningOut ? styles['show'] : ''}`}>
                <div>
                    <div></div>
                </div>
                <div>
                    <div>Signing Out</div>
                </div>
            </div>
            <div className={styles['profile-container']}>
                <div>
                    <Link to={'edit-profile'}><img src={editPen} alt="edit_profile" /></Link>
                </div>
                <div>
                    <div>
                        { userInfo?.profile_pic_url ? <img src={userInfo?.profile_pic_url} alt="" /> : <DefaultUser /> }
                    </div>
                </div>
                <div>
                    <div>
                        {userInfo?.username}
                    </div>
                    <div>
                        {userInfo?.bio || "Friends are just a text away!"}
                    </div>
                </div>
            </div>
            <div className={styles['settings-list-container']}>
                <SettingsBtn iconSrc={notificationIcon} label='Notification' isSwitch={true}/>
                <SettingsBtn iconSrc={userIcon} label='Accounts' linkTo='/settings/accounts'/>
                <SettingsBtn iconSrc={themeIcon} label='Themes' linkTo='/settings/themes'/>
                <SettingsBtn iconSrc={keyIcon} label='Manage Sessions' linkTo='/settings/sessions'/>
            </div>
            <div className={styles['logout-btn']}>
                <div onClick={handleLogout}>Logout</div>
            </div>
            <Confirm primaryAction='Logout' seconderyAction='Dismiss' msg='Log out from your device' />
        </section>
        </>
    )
}
export default SettingsTab

export const Settings = () => {

    return (
        <section>
            Settings bar
        </section>
    )
}

const SettingsBtn = ({iconSrc, label='default_label', isSwitch=false, isEnabled=false, linkTo='/'}) => {
    const { SwitchElement, isOn, setIsOn } = useSwitch()
    const navigate = useSmartNavigate()

    const handleClick = useCallback(() => {
        if (isSwitch) {
            setIsOn(prev => !prev)
        } else {
            navigate(`/chat${linkTo}`)
        }
    }, [isSwitch, setIsOn, navigate, linkTo])

    return (
        <div onClick={handleClick} className={styles['settings-btn']}>
            <div>
                <img src={iconSrc} alt="icon" />
            </div>
            <div>
                {label}
            </div>
            <div>
            { isSwitch ? <SwitchElement /> :
                <FontAwesomeIcon icon={faChevronRight} />
            }
            </div>
        </div>
    )
}
SettingsBtn.propTypes = {
    iconSrc: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    isSwitch: PropTypes.bool,
    linkTo: PropTypes.string
}

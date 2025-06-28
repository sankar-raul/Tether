import styles from './tabs.module.css'
import PropTypes from 'prop-types'
import messageIconActive from '../../assets/svg/chat/message-tab.svg'
import messageIconPassive from '../../assets/svg/chat/chat-passive.svg'
import HambargerPassive from '../../assets/svg/chat/ham-barger.svg'
import CallPassive from '../../assets/svg/chat/call.svg'
import SettingsActive from '../../assets/svg/chat/settings-active.svg'
import callActive from '../../assets/svg/chat/call-active.svg'
import PaintPassive from '../../assets/svg/chat/paint.svg'
import SettingsPassive from '../../assets/svg/chat/settings.svg'
import AboutPassive from '../../assets/svg/chat/about.svg'
import { useCallback, useEffect, useState } from 'react'
import useTabs from '../../context/Tabs/tabs'
import { useMediaQuery } from 'react-responsive'
import { Link } from 'react-router-dom'

const Tabs = () => {
    const { setCurrentTab } = useTabs()
    const isMobile = useMediaQuery({ query: '(max-width: 700px)' })

    const handleTabs = useCallback((tab = "chat") => {
        setCurrentTab(tab)
    }, [setCurrentTab])

    return (
        <nav className={styles['tabs-wraper']}>
            <div className={styles['tabs']}>
                <div>
                    <Tab icon={{active: HambargerPassive, passive: HambargerPassive}} />
                    <Tab type='chat' onClick={() => handleTabs("chat")} icon={{active: messageIconActive, passive: messageIconPassive}}/>
                    <Tab type='calls' onClick={() => handleTabs("calls")} icon={{active: callActive, passive: CallPassive}} />
                </div>
                <div>
                    <Tab icon={{active: PaintPassive, passive: PaintPassive}} />
                    {isMobile ? <Tab type='calls' onClick={() => handleTabs("calls")} icon={{active: callActive, passive: CallPassive}} /> : ''}
                </div>
                <div>
                    <Tab icon={{active: AboutPassive, passive: AboutPassive}} />
                    <Tab type='settings' onClick={() => handleTabs("settings")} icon={{active: SettingsActive, passive: SettingsPassive}} />
                </div>
            </div>
        </nav>
    )
}
export default Tabs

const Tab = ({icon, active = false, type, ...args}) => {
    const { currentTab } = useTabs()
    const [ isActive, setIsActive ] = useState(active)

    useEffect(() => {
        if (type == 'chat' || type == 'calls' || type == 'settings') {
            setIsActive(currentTab == type)
        } else {
            // add logic for other left section buttons
        }
    }, [currentTab, type])

    return (
        <Link className={styles['tab-wraper']} to={`/chat${type=='chat'?'':'/'+type}`}>
        <div {...args} className={`${styles["tab"]} ${isActive ? styles['active'] : ''}`}>
            <img src={isActive ? icon?.active : icon?.passive} alt="tab" />
        </div>
        </Link>

    )
}
Tab.propTypes = {
    icon: PropTypes.object.isRequired,
    active: PropTypes.bool,
    type: PropTypes.string,
    props: PropTypes.object
}
import styles from './tabs.module.css'
import PropTypes from 'prop-types'
import messageTagIconActive from '../../assets/svg/chat/message-tab.svg'
import HambargerPassive from '../../assets/svg/chat/ham-barger.svg'
import CallPassive from '../../assets/svg/chat/call.svg'
import PaintPassive from '../../assets/svg/chat/paint.svg'
import SettingsPassive from '../../assets/svg/chat/settings.svg'
import AboutPassive from '../../assets/svg/chat/about.svg'
const Tabs = () => {

    return (
        <nav className={styles['tabs-wraper']}>
            <div className={styles['tabs']}>
                <div>
                    <Tab icon={HambargerPassive} />
                    <Tab icon={messageTagIconActive} active />
                    <Tab icon={CallPassive} />
                </div>
                <div>
                    <Tab icon={PaintPassive} />
                </div>
                <div>
                    <Tab icon={AboutPassive} />
                    <Tab icon={SettingsPassive} />
                </div>
            </div>
        </nav>
    )
}
export default Tabs

const Tab = ({icon, active = false}) => {

    return (
        <div className={`${styles["tab"]} ${active ? styles['active'] : ''}`}>
            <img src={icon} alt="tab" />
        </div>
    )
}
Tab.propTypes = {
    icon: PropTypes.string.isRequired,
    active: PropTypes.bool
}
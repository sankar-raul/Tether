import styles from './settings.module.css'
import editPen from '../../assets/svg/settings/edit_pen.svg'
import useUserInfo from '../../context/userInfo/userInfo'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight, faUser } from '@fortawesome/free-solid-svg-icons'


const SettingsTab = () => {
    const { userInfo } = useUserInfo()

    return (
        <section className={styles['settings-tab-container']}>
            <div className={styles['profile-container']}>
                <div>
                    <Link to={'edit-profile'}><img src={editPen} alt="edit_profile" /></Link>
                </div>
                <div>
                    <div>
                        <img src={userInfo?.profile_pic_url} alt="" />
                    </div>
                </div>
                <div>
                    <div>
                        {userInfo?.username}
                    </div>
                    <div>
                        {userInfo?.bio}
                    </div>
                </div>
            </div>
            <div className={styles['settings-list-container']}>
                <div className={styles['settings-btn']}>
                    <div>
                        <FontAwesomeIcon icon={faUser} />
                    </div>
                    <div>
                        Account Settings
                    </div>
                    <div>
                        <FontAwesomeIcon icon={faChevronRight} />
                    </div>
                </div>
                <div className={styles['settings-btn']}>
                    <div>
                        <FontAwesomeIcon icon={faUser} />
                    </div>
                    <div>
                        Theme Settings
                    </div>
                    <div>
                        <FontAwesomeIcon icon={faChevronRight} />
                    </div>
                </div>
            </div>
        </section>
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

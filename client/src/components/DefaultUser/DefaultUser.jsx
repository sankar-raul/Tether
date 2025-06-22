import styles from './default-user.module.css'
import userSvg from '../../assets/svg/chat/user.svg'
import defaultUser from '../../assets/images/default_user.avif'

export const DefaultUser = () => {

    return (
        <div className={styles['default-user']}>
            <img src={defaultUser} alt="" />
        </div>
    )
}
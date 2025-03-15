import styles from './default-user.module.css'
import userSvg from '../../assets/svg/chat/user.svg'

export const DefaultUser = () => {

    return (
        <div className={styles['default-user']}>
            <img src={userSvg} alt="" />
        </div>
    )
}
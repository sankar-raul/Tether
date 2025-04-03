import styles from './navbar.module.css'
import appLogo from '../../assets/images/app-dark.png'
import useUserInfo from '../../context/userInfo/userInfo'
import { useEffect } from 'react'
const Navbar = () => {
    const { userInfo } = useUserInfo()

    useEffect(() => {
        // console.log(userInfo)
    }, [userInfo])
    return (
        <div className={styles.navbar}>
            <img src={appLogo} className={styles.appLogo} alt="TETHER" />
            {userInfo ? "Hello " + userInfo.username : ''}
        </div>
    )
}

export default Navbar
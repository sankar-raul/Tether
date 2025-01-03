import styles from './navbar.module.css'
import appLogo from '../../assets/app-dark.svg'
const Navbar = () => {

    return (
        <div className={styles.navbar}>
            <img src={appLogo} className={styles.appLogo} alt="TETHER" />

        </div>
    )
}

export default Navbar
import styles from './header.module.css'
import searchIcon from '../../../assets/svg/chat/search-icon.svg'

const Header = () => {

    return (
        <div className={styles.header}>
            <h1 className={styles['app-name']}>Tether</h1>
            <Search />
            <div className={styles['user']}>
                <img src="/me.jpg" alt="" />
            </div>
        </div>
    )
}
export default Header

const Search = () => {

    return (
        <form className={styles['search-box']}>
            <div className={styles['search-input-wraper']}>
                <input className={styles['search-input']} type="text" placeholder='search for an user' />
            </div>
            <button type='submit' className={styles['search-button']}>
                <img src={searchIcon} alt="search" />
            </button>
        </form>
    )
}
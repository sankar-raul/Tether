import searchIcon from '../../../assets/svg/chat/search-icon.svg'
import styles from './contact-search.module.css'
const SearchMyContacts = () => {

    return (
        <div className={styles['search-contact-container']}>
            <div className={styles["contact-search"]}>
                <div className={styles['search-icon']}>
                    <img src={searchIcon} alt="search_contact" />
                </div>
                <input type="text"  placeholder='Search your contact'/>
            </div>
        </div>
    )
}
export default SearchMyContacts
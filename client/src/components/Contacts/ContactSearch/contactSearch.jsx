import styles from './contact-search.module.css'
const SearchMyContacts = () => {

    return (
        <div className={styles['search-contact-container']}>
            <div>
                <input type="text"  placeholder='Search your contact'/>
            </div>
        </div>
    )
}
export default SearchMyContacts
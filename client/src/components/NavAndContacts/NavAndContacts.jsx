import Contacts from '../Contacts/Contacts'
import Tabs from '../Tabs/Tabs'
import styles from './navAndContact.module.css'

const NavAndContact = () => {
    
    return (
    <aside className={styles['left-side']}>
        <Tabs />
        <Contacts />
    </aside>
    )
}
export default NavAndContact
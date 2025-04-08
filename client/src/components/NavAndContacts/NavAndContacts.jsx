import { useMediaQuery } from 'react-responsive'
import Contacts from '../Contacts/Contacts'
import Tabs from '../Tabs/Tabs'
import styles from './navAndContact.module.css'

const NavAndContact = () => {
    const isMobile = useMediaQuery({ query: '(max-width: 700px)' })
    
    return (
    <aside className={styles['left-side'] + ' ' + styles['mobile']}>
        <Tabs />
        <Contacts />
    </aside>
    )
}
export default NavAndContact
import { useCallback, useEffect, useState } from 'react'
import useResize from '../../context/resizeableAside/resizeableAside'
import styles from './contacts.module.css'
import PropTypes from 'prop-types'
import useContacts from '../../context/contacts/contact'
import useTabs from '../../context/Tabs/tabs'

const Contacts = () => {
    const { resizeableDiv, handleMouseDown } = useResize()
    const { currentTab } = useTabs()

    return (
        <div className={styles['contacts-wraper']}>
            <div ref={resizeableDiv}  className={styles['contacts']}>
                {
                    currentTab == 'chat' ? <Chats /> : <Calls />
                }
            </div>
            <div onMouseDown={handleMouseDown} className={styles['handle-resize']}></div>
        </div>
    )
}
export default Contacts

const Calls = () => {

    return (
        <h1>Calls</h1>
    )
}
const Chats = () => {
    const { contacts } = useContacts()
    return (
        <>
        {
            contacts?.map(user => (
                <Contact key={user?.id} user={user} />
            ))
        }
        </>
    )
}

const Contact = ({ user }) => {
    const [ isActive, setIsActive ] = useState(false)
    const { selectedContact, setSelectedContact } = useContacts()

    const togglwActive = useCallback(() => {
        setSelectedContact(user?.id)
    }, [user, setSelectedContact])

    useEffect(() => {
        setIsActive(selectedContact == user?.id)
    }, [selectedContact, user])
    return (
        <div onClick={togglwActive} className={`${styles['contact']} ${isActive ? styles['active'] : ''}`}>
            <div className={styles['profile']}>
                <img src="/me.jpg" alt="user" />
            </div>
            <div className={styles['user-info']}>
                <div className={styles['user-meta-data']}>
                    <div className={styles['username']}>{user?.name}</div>
                    <div className={styles['last-msg']}>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Natus, facere inventore! Odio obcaecati quia, et quas minus aspernatur corporis aut dolores cum quasi ullam dignissimos beatae eos porro atque iure?
                    </div>
                </div>
                <div className={styles['user-status']}>
                    <div className={styles['last-msg-time']}>
                        07-07-2025
                    </div>
                    <div className={styles['unread-msg-count']}>
                        <div><p>2</p></div>
                    </div>
                </div>
            </div>
        </div>
    )
}
Contact.propTypes = {
    user: PropTypes.object.isRequired,
    active: PropTypes.bool
}
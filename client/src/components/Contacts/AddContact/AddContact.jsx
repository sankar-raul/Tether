import { useCallback } from 'react'
import styles from './addContact.module.css'
import useContacts from '../../../context/contacts/contact'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'

export const AddContact = ({...props}) => {
    const { setIsOpenSearch } = useContacts()

    const handleAddContact = useCallback(() => {
        setIsOpenSearch(true)
    }, [setIsOpenSearch])

    return (
        <div className={styles['add-new-contact-container']} {...props}>
            <div>
                <p>Add new contact</p>
            </div>
            <div>
                <button onClick={handleAddContact}>
                    Add new contact
                </button>
            </div>
        </div>
    )
}

export const AddContactsBtn = () => {
    const { setIsOpenSearch } = useContacts()

    return (
        <div className={styles['add-contact-btn']} onClick={() => setIsOpenSearch(true)}>
            <button className={styles['plus-icon']}>
                <FontAwesomeIcon icon={faPlus}/>
            </button>
        </div>
    )
}
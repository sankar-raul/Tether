import { memo, useCallback } from 'react'
import styles from './addContact.module.css'
import useContacts from '../../context/contacts/contact'

const AddContact = () => {
    const { setIsOpenSearch } = useContacts()

    const handleAddContact = useCallback(() => {
        setIsOpenSearch(true)
    }, [setIsOpenSearch])

    return (
        <div className={styles['add-new-contact-container']}>
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
export default memo(AddContact)
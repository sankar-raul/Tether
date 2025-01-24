import useResize from '../../context/resizeableAside/resizeableAside'
import styles from './contacts.module.css'
import PropTypes from 'prop-types'

const Contacts = () => {
    const { resizeableDiv, handleMouseDown } = useResize()

    return (
        <div className={styles['contacts-wraper']}>
            <div ref={resizeableDiv}  className={styles['contacts']}>
                contacts
            </div>
            <div onMouseDown={handleMouseDown} className={styles['handle-resize']}></div>
        </div>
    )
}
export default Contacts

const Contact = ({ user }) => {

    return (
        <div className={styles['tab']}>
            <div className={styles['profile']}>
                <img src="/me.jpg" alt="user" />
            </div>
            <div className="lol">
                {user}
            </div>
        </div>
    )
}
Contact.propTypes = {
    user: PropTypes.string.isRequired
}
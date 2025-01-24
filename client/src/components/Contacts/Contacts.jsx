import useResize from '../../context/resizeableAside/resizeableAside'
import styles from './contacts.module.css'

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
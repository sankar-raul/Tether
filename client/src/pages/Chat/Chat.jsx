import styles from './chat.module.css'
import NavAndContact from '../../components/NavAndContacts/NavAndContacts'
import ResizeableAsideProvider from '../../context/resizeableAside/provider'
const Chat = () => {
    
    return (
        <section className={styles['chat-view']}>
            <ResizeableAsideProvider>
                <NavAndContact />
            </ResizeableAsideProvider>
            <div className={styles['chat-box']}>
                chat
            </div>
        </section>
    )
}
export default Chat
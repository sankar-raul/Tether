import { Outlet } from 'react-router-dom'
import styles from './chatlayout.module.css'
import Header from '../../components/ChatComponents/Header/Header'

const ChatLayout = () => {

    return (
        <main className={styles['chat-layout']}>
            <Header />
            <Outlet />
        </main>
    )
}
export default ChatLayout
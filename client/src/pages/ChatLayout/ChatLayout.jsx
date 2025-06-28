import { Outlet } from 'react-router-dom'
import styles from './chatlayout.module.css'
import Header from '../../components/ChatComponents/Header/Header'
import SocketProvider from '../../context/socket/provider'
import TabsProvider from '../../context/Tabs/provider'
import ResizeableAsideProvider from '../../context/resizeableAside/provider'
import NavAndContact from '../../components/NavAndContacts/NavAndContacts'
import RightContainer from '../../components/RightContainer/RightContainer'
import Contacts from '../../components/Contacts/Contacts'
import Tabs from '../../components/Tabs/Tabs'

const ChatLayout = () => {

    return (
        <main className={styles['chat-layout']}>
            
        <SocketProvider>
        <TabsProvider>
        <Header />
            <section className={styles['chat-view']}>
                <ResizeableAsideProvider>
                <aside className={styles['left-side']}>
                <Tabs />
                <Contacts >
                    <Outlet />
                </Contacts>
                </aside>
                </ResizeableAsideProvider>
                <RightContainer />
            </section>
        </TabsProvider>
        </SocketProvider>
        </main>
    )
}
export default ChatLayout
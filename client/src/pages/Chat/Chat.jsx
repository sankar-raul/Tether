import styles from './chat.module.css'
import NavAndContact from '../../components/NavAndContacts/NavAndContacts'
import ResizeableAsideProvider from '../../context/resizeableAside/provider'
// import ContactsProvider from '../../context/contacts/provider'
import TabsProvider from '../../context/Tabs/provider'
import RightContainer from '../../components/RightContainer/RightContainer'
import SocketProvider from '../../context/socket/provider'
import Tabs from '../../components/Tabs/Tabs'
import Contacts from '../../components/Contacts/Contacts'
import { Outlet } from 'react-router-dom'

const Chat = () => {
    
    return (
        <SocketProvider>
        <TabsProvider>
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
    )
}
export default Chat
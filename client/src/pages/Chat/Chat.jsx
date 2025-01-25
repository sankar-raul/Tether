import styles from './chat.module.css'
import NavAndContact from '../../components/NavAndContacts/NavAndContacts'
import ResizeableAsideProvider from '../../context/resizeableAside/provider'
import ContactsProvider from '../../context/contacts/provider'
import TabsProvider from '../../context/Tabs/provider'
import RightContainer from '../../components/RightContainer/RightContainer'
const Chat = () => {
    
    return (
        <TabsProvider>
            <ContactsProvider>
                <section className={styles['chat-view']}>
                    <ResizeableAsideProvider>
                        <NavAndContact />
                    </ResizeableAsideProvider>
                    <RightContainer />      
                </section>
            </ContactsProvider>
        </TabsProvider>
    )
}
export default Chat
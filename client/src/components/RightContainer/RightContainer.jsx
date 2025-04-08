import { useMediaQuery } from "react-responsive"
import ChatProvider from "../../context/chatSocket/provider"
import MessageProvider from "../../context/messages/provider"
import useTabs from "../../context/Tabs/tabs"
import CallBox from "../CallBox/CallBox"
import ChatBox from "../ChatBox/ChatBox"
import styles from "./rightcontainer.module.css"
import useContacts from "../../context/contacts/contact"
const RightContainer = () => {
    const { currentTab } = useTabs()
    const isMobile = useMediaQuery({ query: '(max-width: 700px)' })
    const { selectedContact } = useContacts()

    // console.log(selectedContact)

    return (
        <MessageProvider>
            <ChatProvider>
                <div className={`${styles[`right-container`]} ${styles[isMobile ? 'mobile' : '']} ${!selectedContact ? styles['show']: ''}`}>
                    { currentTab == 'chat' ? <ChatBox /> : <CallBox /> }
                </div>
            </ChatProvider>
        </MessageProvider>
    )
}
export default RightContainer
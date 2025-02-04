import ChatProvider from "../../context/chatSocket/provider"
import MessageProvider from "../../context/messages/provider"
import useTabs from "../../context/Tabs/tabs"
import CallBox from "../CallBox/CallBox"
import ChatBox from "../ChatBox/ChatBox"
import styles from "./rightcontainer.module.css"
const RightContainer = () => {
    const { currentTab } = useTabs()
    
    return (
        <MessageProvider>
            <ChatProvider>
                <div className={styles['right-container']}>
                    { currentTab == 'chat' ? <ChatBox /> : <CallBox /> }
                </div>
            </ChatProvider>
        </MessageProvider>
    )
}
export default RightContainer
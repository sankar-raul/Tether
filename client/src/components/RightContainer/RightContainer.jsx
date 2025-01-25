import useTabs from "../../context/Tabs/tabs"
import CallBox from "../CallBox/CallBox"
import ChatBox from "../ChatBox/ChatBox"
import styles from "./rightcontainer.module.css"
const RightContainer = () => {
    const { currentTab } = useTabs()
    
    return (
        <div className={styles['right-container']}>
            { currentTab == 'chat' ? <ChatBox /> : <CallBox /> }
        </div>
    )
}
export default RightContainer
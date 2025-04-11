import ChatProvider from "../../context/chatSocket/provider"
import MessageProvider from "../../context/messages/provider"
import useTabs from "../../context/Tabs/tabs"
import CallBox from "../CallBox/CallBox"
import ChatBox from "../ChatBox/ChatBox"
import styles from "./rightcontainer.module.css"
import useContacts from "../../context/contacts/contact"
import { useEffect } from "react"
import { useMediaQuery } from "react-responsive"
import { debounce, throttle } from '../../utils/helperFunctions'

const RightContainer = () => {
    const { currentTab } = useTabs()
    const { selectedContact } = useContacts()
    const isMobile = useMediaQuery({ query: '(max-width: 700px)' })

    useEffect(() => {
        if (!isMobile) {
            return
        }
        const setHeight = () => {
            // console.log(window.innerHeight)
            document.documentElement.style.setProperty('--window-height', `${window.innerHeight}px`)
        }
        const setChatBoxHeightDebounce = debounce(setHeight, 50)
        const setChatBoxHeightThrottle = throttle(setHeight, 50) // 👍

        const setChatBoxHeight = () => {
            setChatBoxHeightThrottle()
            setChatBoxHeightDebounce()
        }
        window.addEventListener('resize', setChatBoxHeight)
        setHeight()
        return () => {
            window.removeEventListener('resize', setChatBoxHeightDebounce)
        }
    }, [isMobile])

    return (
        <MessageProvider>
            <ChatProvider>
                <div className={`${styles[`right-container`]} ${!selectedContact ? styles['hide']: ''}`}>
                    { currentTab == 'chat' ? <ChatBox /> : <CallBox /> }
                </div>
            </ChatProvider>
        </MessageProvider>
    )
}
export default RightContainer
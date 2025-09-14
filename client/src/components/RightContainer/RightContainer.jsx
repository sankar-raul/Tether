import ChatProvider from "../../context/chatSocket/provider"
import MessageProvider from "../../context/messages/provider"
import useTabs from "../../context/Tabs/tabs"
import CallBox from "../CallBox/CallBox"
import ChatBox from "../ChatBox/ChatBox"
import { Settings } from "../SettingsTab/Settings"
import styles from "./rightcontainer.module.css"
import useContacts from "../../context/contacts/contact"
import { useEffect, useState } from "react"
import PropTypes from 'prop-types'

const RightContainer = ({children, isHidden}) => {
    // const { currentTab } = useTabs()
    // const { selectedContact } = useContacts()
    // const [ Element, setElement ] = useState(() => ChatBox)
    
    // useEffect(() => {
    //     console.log(currentTab)
    //     setElement(_ => {
    //         switch (currentTab) {
    //             case 'chat':
    //                 return ChatBox
    //             case 'call':
    //                 return CallBox
    //             case 'settings':
    //                 return Settings
    //             default:
    //                 return _
    //         }
    //     })
    // }, [currentTab])
    // console.log(isHidden)
    return (
        <MessageProvider>
            <ChatProvider>
                <div className={`${styles[`right-container`]} ${isHidden ? styles['hide']: ''}`}>
                {/* <div className={`${styles[`right-container`]}`}> */}
                    {children}
                </div>
            </ChatProvider>
        </MessageProvider>
    )
}
RightContainer.propTypes = {
    children: PropTypes.node.isRequired,
    isHidden: PropTypes.bool
}
export default RightContainer
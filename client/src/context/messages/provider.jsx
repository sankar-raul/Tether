import { useState } from "react"
import { MessageContext } from "./messages"
import PropTypes from 'prop-types'
const MessageProvider = ({children}) => {
    const [messagesMap, setMessagesMap] = useState(new Map())
    // const socket 

    
    return (
        <MessageContext.Provider value={{}}>
            {children}
        </MessageContext.Provider>
    )
}
MessageProvider.propTypes = {
    children: PropTypes.node.isRequired
}
export default MessageProvider
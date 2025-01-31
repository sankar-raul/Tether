import { useCallback, useState } from "react"
import { MessageContext } from "./messages"
import PropTypes from 'prop-types'
import apiRequest from "../../hook/apiRequest"
const MessageProvider = ({children}) => {
    const [messagesMap, setMessagesMap] = useState(new Map())


    const getMessages = useCallback(async (id) => {
        if (!id) return
        const [response, error] = await apiRequest(`/chat/messages/${id}`)
        if (!error) {
            return response
        }
    }, [])
    return (
        <MessageContext.Provider value={{getMessages}}>
            {children}
        </MessageContext.Provider>
    )
}
MessageProvider.propTypes = {
    children: PropTypes.node.isRequired
}
export default MessageProvider
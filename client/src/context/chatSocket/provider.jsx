import useMsgSocket from '../../hook/useMsgSocket'
import useContacts from '../contacts/contact'
import { chatContext } from './chatSocket'
import PropTypes from 'prop-types'

const ChatProvider = ({children}) => {
    const { selectedContact } = useContacts()
    const { messages, seeMsg, sendMsg } = useMsgSocket(Number(selectedContact))

    return (
        <chatContext.Provider value={{messages, seeMsg, sendMsg}}>
            {children}
        </chatContext.Provider>
    )
}
ChatProvider.propTypes = {
    children: PropTypes.node.isRequired
}
export default ChatProvider
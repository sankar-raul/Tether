import { SocketContext } from "./socket"
import PropTypes from 'prop-types'
import socket from '../../utils/chatSocket'
import { useMemo } from "react"
const SocketProvider = ({children}) => {
    const Socket = useMemo(() => socket, [])
 
    return (
        <SocketContext.Provider value={{Socket}}>
            {children}
        </SocketContext.Provider>
    )
}
SocketProvider.propTypes = {
    children: PropTypes.node.isRequired
}
export default SocketProvider
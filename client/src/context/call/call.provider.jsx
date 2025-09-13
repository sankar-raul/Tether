import { useCallback, useState } from "react"
import { CallContext } from "./call.context"
import CallBox from "../../components/CallBox/CallBox"
import PropTypes from 'prop-types'

export default function CallProvider({children}) {
    const [ isShowCallBox, setShowCallBox ] = useState(false)
    const [ isConnected, setIsConnected ] = useState(false)
    const [ callReciverId, setCallReciverId ] = useState(null)

    const handleCallEnd = useCallback((isCallEnded) => {
        setShowCallBox(!isCallEnded)
    }, [])

    const startCall = useCallback(({
        contact_id,
        type = 'video', // audio | video
    }) => {
        if (!contact_id) {
            console.error("contact_id can't be undefined!:-> startCall()")
            return
        }
        setShowCallBox(true)
    }, [])
    return (
        <CallContext.Provider value={{startCall}}>
            {children}
            {isShowCallBox ? <CallBox setIsCallEnded={handleCallEnd} /> : <></>}
        </CallContext.Provider>
    )
}
CallProvider.propTypes = {
    children: PropTypes.node.isRequired
}
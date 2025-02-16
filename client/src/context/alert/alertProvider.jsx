import { useCallback, useEffect, useState } from "react"
import { AlertContext } from "./alert"
import PropTypes from 'prop-types'
import styles from './alert.module.css'

const AlertBanner = ({title, message, type}) => {

    return (
        <div>
            <p>{message}</p>
        </div>
    )
}
AlertBanner.propTypes = {
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired
}

const intervalRef = null
const AlertProvider = ({children}) => {
    const [ messages, setMessages ] = useState([])

    const Alert = useCallback(({title='Alert', message='', type = 'info'}) => {
        setMessages(prev => [...prev, {title, message, type}])
    }, [])
    useEffect(() => {
        if (messages.length > 0) {
            if (intervalRef) {
                setInterval(() => {
                    setMessages(prev => {
                        prev.shift()
                        return prev
                    })
                }, 500)
            }
        } 
    }, [messages])
    return (
        <AlertContext.Provider value={{Alert}}>
            {children}
            <div className={styles['alert-container']}>
                ok si
                {messages.map((msg, idx) => (
                    <AlertBanner key={idx} title={msg.title} message={msg.message} type={msg.type} />
                ))}
            </div>
        </AlertContext.Provider>
    )
}
AlertProvider.propTypes = {
    children: PropTypes.node.isRequired
}

export default AlertProvider
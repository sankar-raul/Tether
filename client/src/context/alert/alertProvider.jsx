import { useCallback, useEffect, useMemo, useState } from "react"
import { AlertContext } from "./Alert"
import PropTypes from 'prop-types'
import styles from './alert.module.css'

const AlertBanner = ({title, message, type}) => {
    const [ display, setDisplay ] = useState(true)
    const msgAcentColor = useMemo(() => {
        switch(type) {
            case 'error':
                return 'var(--danger-color)'
            case 'info':
                return 'var(--brand-color)'
            default:
                return 'green'
        }
    }, [type])
    useEffect(() => {
        const timeOut = setTimeout(() => {
            setDisplay(false)
        }, 3000)
        return () => clearTimeout(timeOut)
    }, [type])
    return (
        <>
        {display ? 
        <div className={styles['alert-msg']} style={{'--acent-color': msgAcentColor}}>
            <p>{message}</p>
        </div>
        : ''}
        </>
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
                }, 500) // fix it
            }
        } 
    }, [messages])
    return (
        <AlertContext.Provider value={{Alert}}>
            {children}
            <div className={styles['alert-container']}>
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

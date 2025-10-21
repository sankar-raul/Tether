import { useCallback, useRef, useState } from "react"
import styles from './useConfirm.module.css'
import { ConfirmContext } from "./confirm.context"
import PropTypes from 'prop-types'
import { createPortal } from "react-dom"

export const ConfirmProvider = ({children}) => {
    const [ isShow, setIsShow ] = useState()
    const promiseRef = useRef(null)
    const [ confirmDetails, setConfirmDetails ] = useState({})

    const handleHide = useCallback(() => {
        promiseRef.current?.resolveFn(false)
        setIsShow(false)
    }, [])
    const handleConfirm = useCallback(() => {
        promiseRef.current?.resolveFn(true)
        setIsShow(false)
    }, [])
    const stopPropagation = useCallback((e) => {
        e.stopPropagation()
    }, [])
    const hideConfirm = useCallback(() => {
        setIsShow(false)
    }, [])
    const defer = () => {
        let resolveFn, rejectFn
        const promise = new Promise((resolve, reject) => {
            resolveFn = resolve
            rejectFn = reject
        })
        return { rejectFn, resolveFn, promise }
    }
    const Confirm = useCallback(({msg='Confirm Action', primaryAction = 'Confirm', seconderyAction = 'Cancel'}={}) => {
        promiseRef.current = defer()
        setConfirmDetails({
            msg,
            primaryAction,
            seconderyAction
        })
        setIsShow(true)
        return promiseRef.current?.promise
    }, [])
    const ConfirmComponent =  useCallback(({msg='Confirm Action', primaryAction = 'Confirm', seconderyAction = 'Cancel'}) => isShow ? 
        createPortal(
            <div onClick={hideConfirm} className={styles['container']}>
                <div className={styles['confirm-bar']} onClick={stopPropagation}>
                    <div className={styles['title-msg']}>
                        <p>{msg}</p>
                    </div>
                    <div className={styles['actions']}>
                        <button onClick={handleHide}>{seconderyAction}</button>
                        <button onClick={handleConfirm}>{primaryAction}</button>
                    </div>
                </div>
            </div>,
            document.getElementById('popup-container'))
        : ''
    , [isShow, handleHide, handleConfirm, stopPropagation, hideConfirm])

    // return { Confirm, isConfirmed, setIsShow }

    return (
        <ConfirmContext.Provider value={{Confirm}}>
            {children}
            <ConfirmComponent {...confirmDetails} />
        </ConfirmContext.Provider>
    )
}
ConfirmProvider.propTypes = {
    children: PropTypes.node.isRequired
}
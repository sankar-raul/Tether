import { useCallback, useState } from "react"
import styles from './useConfirm.module.css'

export const useConfirm = () => {
    const [ isConfirmed, setIsConfirmed ] = useState(null)
    const [ isShow, setIsShow ] = useState()

    const handleHide = useCallback(() => {
        setIsShow(false)
        setIsConfirmed(false)
    }, [])
    const handleConfirm = useCallback(() => {
        setIsShow(false)
        setIsConfirmed(true)
    }, [])
    const stopPropagation = useCallback((e) => {
        e.stopPropagation()
    }, [])
    const hideConfirm = useCallback(() => {
        setIsShow(false)
    }, [])
    const Confirm =  useCallback(({msg='Confirm Action', primaryAction = 'Confirm', seconderyAction = 'Cancel'}) => isShow ? 
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
        </div>
        : ''
    , [isShow, handleHide, handleConfirm, stopPropagation, hideConfirm])

    return { Confirm, isConfirmed, setIsShow }
}
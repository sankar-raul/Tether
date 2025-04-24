import { useCallback, useState } from "react"
import styles from './useConfirm.module.css'

export const useConfirm = () => {
    const [ isConfirmed, setIsConfirmed ] = useState()
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
    const Confirm =  useCallback(() => isShow ? 
        <div className={styles['container']} onClick={stopPropagation}>
            <div className={styles['confirm-bar']}>
                <div className={styles['title-msg']}>
                    <p>Delete all messages</p>
                </div>
                <div className={styles['actions']}>
                    <button onClick={handleHide}>Cancel</button>
                    <button onClick={handleConfirm}>Confirm</button>
                </div>
            </div>
        </div>
        : ''
    , [isShow, handleHide, handleConfirm, stopPropagation])

    return { Confirm, isConfirmed, setIsShow }
}
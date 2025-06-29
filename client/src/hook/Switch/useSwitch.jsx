import { useCallback, useEffect, useState } from 'react'
import styles from './useSwitch.module.css'

export default function useSwitch({isOn=false, acentColor, ...props}={}) {
    const [ isEnabled, setIsEnabled ] = useState(isOn)

    const handleSwitchClick = useCallback((e) => {
        e.stopPropagation()
        setIsEnabled(prev => !prev)
    }, [])

    useEffect(() => {
        console.log(isEnabled)
    }, [isEnabled])
    const SwitchElement = () => <div onClick={handleSwitchClick} {...props} className={`${styles['switch-parent']} ${isEnabled ? ' ' + styles['on'] : ''}`}>
                            <div></div>
                        </div>
    return { isOn: isEnabled, setIsOn: setIsEnabled, SwitchElement }
}
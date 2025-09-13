import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styles from './call-controll-button.module.css'
import { useCallback, useState } from 'react'
import PropTypes from 'prop-types'


export default function CallControllButton({icon, fontawesomeIcon, onClick, alt, label, type, className, active, ...props}) {
    const [ isClicked, setIsClicked ] = useState(active)

    const handleClick = useCallback((e) => {
        setIsClicked(prev => !prev)
        typeof onClick == 'function' && onClick(e)
    }, [onClick])
    
    const getButtonVarientClass = useCallback(() => {
        const validVarientMap = {
            'danger': 'danger',
            // etc
        }
        const varientClass = styles[validVarientMap[type]]
        return varientClass
    }, [type])
    return (
       <div onClick={handleClick} className={`${styles['call-controller-button']} ${getButtonVarientClass``} ${isClicked ? styles['active'] : ''} ${className}`} data-label={label} {...props}>
            <div>
                { 
                    fontawesomeIcon ? 
                        <FontAwesomeIcon icon={fontawesomeIcon} />
                        : <img src={icon} alt={alt} /> 
                }
            </div>
        </div>
    )
}
CallControllButton.propTypes = {
    icon: PropTypes.string,
    alt: PropTypes.string,
    label: PropTypes.string,
    type: PropTypes.string,
    className: PropTypes.string,
    fontawesomeIcon: PropTypes.object,
    onClick: PropTypes.func,
    active: PropTypes.bool
}
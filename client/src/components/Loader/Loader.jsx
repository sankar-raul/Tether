import { ShowUser } from '../ChatComponents/SearchWindow/SearchWindow'
import styles from './loader.module.css'
import PropTypes from 'prop-types'

export const Loader = ({dotWidth, color, align, speed, type, count = 2, ...props}) => {

    return (
        <> 
        { type == 'skeleton' ? <>
                {Array(count).fill(0).map((_, idx) => <ShowUser key={idx} skeleton={true} animationDelay={'0s'} {...props} />)}
                </>
             : (
            <div className={styles['loading-animation']} style={{'--dot-width': dotWidth || '8px', '--dot-color': color || 'var(--brand-color)', '--align': align || 'center', '--speed': speed || '.8s'}} {...props}>
                <div style={{'--delay': '.1s'}}></div>
                <div style={{'--delay': '.2s'}}></div>
                <div style={{'--delay': '.3s'}}></div>
                <div style={{'--delay': '.4s'}}></div>
            </div>
        )}
        </>
    )
}
Loader.propTypes = {
    dotWidth: PropTypes.string,
    color: PropTypes.string,
    align: PropTypes.string,
    speed: PropTypes.string,
    type: PropTypes.string,
    count: PropTypes.number
}
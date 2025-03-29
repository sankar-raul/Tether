import styles from './call.module.css'
import PropTypes from 'prop-types'
export const Call = ({type = 'audio', to}={}) => {
    
    return (
        <section className={styles['']}>
            Calling...
        </section>
    )
}
Call.propTypes = {
    type: PropTypes.string,
    to: PropTypes.any.isRequired
}

const AudioCall = () => {
    
    return (
        <div>
            Audio Calling...
        </div>
    )
}
const VideoCall = () => {

    return (
        <div>
            Video Calling...
        </div>
    )
}
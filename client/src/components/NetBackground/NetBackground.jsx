import PropTypes from 'prop-types'
import styles from './netbg.module.css'
const NetBackground = ({ children }) => {

    return (
        <div className={styles.netbackground}>
            {children}
        </div>
    )
}
NetBackground.propTypes = {
    children: PropTypes.node
}
export default NetBackground
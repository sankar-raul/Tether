import styles from './input-box.module.css'
import PropTypes from 'prop-types'

export default function InputBox({
    isError,
    label,
    register = {},
    ...props
}) {

    return (
        <div className={styles.inputBox}>
             <div name={!isError ? 'true' : 'incorrect'} className={styles['input-wraper']}>
                 <input name={label} placeholder=" " {...register} {...props} />
                 <label htmlFor={label}>{label}</label>
             </div>
        </div>
    )
}
InputBox.propTypes = {
    isError: PropTypes.bool,
    label: PropTypes.string.isRequired,
    register: PropTypes.object
}
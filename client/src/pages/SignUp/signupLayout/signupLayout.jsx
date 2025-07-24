// import PropTypes from 'prop-types'
import styles from './signupLayout.module.css'
import NetBackground from '../../../components/NetBackground/NetBackground'
import { Outlet } from 'react-router-dom'

const SignUpLayout = () => {


    return (
        <NetBackground>
            <div className={styles['sign-layout']}>
                <Outlet />
            </div>
        </NetBackground>
    )
}
export default SignUpLayout
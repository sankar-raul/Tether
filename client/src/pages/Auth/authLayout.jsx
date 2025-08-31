// import PropTypes from 'prop-types'
import styles from './auth-layout.module.css'
import NetBackground from '../../components/NetBackground/NetBackground'
import { Outlet } from 'react-router-dom'

const AuthLayout = () => {


    return (
        <NetBackground>
            <div className={styles['auth-layout']}>
                <Outlet />
            </div>
        </NetBackground>
    )
}
export default AuthLayout
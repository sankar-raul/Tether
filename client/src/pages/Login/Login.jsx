import NetBackground from '../../components/NetBackground/NetBackground'
import styles from './login.module.css'

const Login = () => {

    return (
        <NetBackground>
        <div className={styles.login}>
            <h1 className={styles.wellcome}>
                Login
            </h1>
            <form className={styles.form}>
                <div className={styles.inputBox}>
                    <div className={styles['input-wraper']}>
                        <input required type="text" id='email' autoComplete='email' />
                        <label htmlFor='email'>Email</label>
                    </div>
                </div>
                <div className={styles.inputBox}>
                    <div className={styles['input-wraper']}>
                        <input required type="password" id='password' />
                        <label htmlFor='password'>Password</label>
                    </div>
                </div>
               <div className={styles.submitBtn}>
                    <input type="submit" value="Login"/>
               </div>
            </form>
        </div>
        </NetBackground>
    )
}

export default Login
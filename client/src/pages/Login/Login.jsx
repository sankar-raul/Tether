import NetBackground from '../../components/NetBackground/NetBackground'
import styles from './login.module.css'

const Login = () => {

    return (
        <NetBackground>
        <div className={styles.login}>
            <h1 className={styles.wellcome}>
                Happy to see you again
            </h1>
            <form className={styles.form}>
                <div className={styles.inputBox}>
                    <label htmlFor='email'>
                        email
                        <input type="text" id='email' autoComplete='email' />
                    </label>
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
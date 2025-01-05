import { Link } from "react-router-dom"
import NetBackground from "../../components/NetBackground/NetBackground"
import styles from './signup.module.css'
import { useEffect, useState } from "react"

const SignUp = () => {
    const [ formData, setFormData ] = useState({})
    const [ isValidData, setISValidData ] = useState({})
    const handleDataInput = (e) => {
        setFormData(prev => ({...prev, [e.target.name]: e.target.value}))
    }
    useEffect(() => {
        console.log(formData)
    }, [formData])
    return (
        <NetBackground>
                <div className={styles.login}>
                    <h1 className={styles.wellcome}>
                        Sign Up
                    </h1>
                    <form className={styles.form}>
                        <div className={styles.inputBox}>
                            <div className={styles['input-wraper']}>
                                <input onChange={handleDataInput} value={formData['name'] || ''} type="text" id='name' name="name" autoComplete='nickname' />
                                <label htmlFor='name'>Name</label>
                            </div>
                        </div>
                        <div className={styles.inputBox}>
                            <div className={styles['input-wraper']}>
                                <input onChange={handleDataInput} value={formData['email'] || ''} type="text" id='email' name="email" autoComplete='email' />
                                <label htmlFor='email'>Email</label>
                            </div>
                        </div>
                        <div className={styles.inputBox}>
                            <div className={styles['input-wraper']}>
                                <input onChange={handleDataInput} value={formData['password'] || ''} type="password" name="password" id='password' />
                                <label htmlFor='password'>Password</label>
                            </div>
                        </div>
                       <div className={styles.submitBtn}>
                            <input type="submit" value="Sign Up"/>
                       </div>
                       <div className={styles.submitBtn + " " + styles.help}>
                            <p>Allready have an account. <Link to='/login'>Login here</Link></p>
                        </div>
                    </form>
                </div>
            </NetBackground>
    )
}

export default SignUp
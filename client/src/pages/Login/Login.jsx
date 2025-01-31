import { Link, useNavigate } from 'react-router-dom'
import NetBackground from '../../components/NetBackground/NetBackground'
import styles from './login.module.css'
import { memo, useCallback } from 'react'
import apiRequest from '../../hook/apiRequest'
// import useUserInfo from '../../context/userInfo/userInfo' // if use logged in provide user info
import { useForm } from 'react-hook-form'

const Login = () => {

    const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({
        defaultValues: {
            email: ''
        }
    })
    const navigate = useNavigate()

    const login = useCallback(async (formData) => {
        console.log(formData)
            const [ data, error ] = await apiRequest('/auth/login', {
                method: "POST",
                body: formData
            })
            if (data) {
                if (data.success) navigate('/chat')
            } else {
                console.log(error)
                if (error.msg == "incorrect password!") {
                    setError('password', {message: "incorrect password"})
                } else if (error.msg == "user not found!") {
                    setError('email', {message: 'user not found'})
                }
            }
    }, [ navigate, setError ])

    return (
        <NetBackground>
        <div className={styles.login}>
            <h1 className={styles.wellcome}>
                Login
            </h1>
            <form className={styles.form} onSubmit={handleSubmit(login)}>
                <div className={styles.inputBox}>
                    <div name={!errors.email ? 'true' : 'incorrect'} className={styles['input-wraper']}>
                        <input type="text" {...register("email", {required: { value: true, message: "required" }, pattern: { value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: "invalid email" }})} autoComplete='email' />
                        <label htmlFor='email'>Email</label>
                    </div>
                </div>
                <div className={styles.inputBox}>
                    <div name={!errors.password ? 'true' : 'incorrect'} className={styles['input-wraper']}>
                        <input type="password" {...register('password', {required: {value: true, message: "password required"}, minLength: {value: 6, message: "password lengtth must be greater than 6"}})} />
                        <label htmlFor='password'>Password</label>
                    </div>
                </div>
                <div className={styles.forgot}>
                    <Link to='/forgot'>forgot password</Link>
                </div>
                <div className={styles.submitBtn}>
                    <input disabled={isSubmitting} type="submit" value="Login"/>
                </div>
                <div className={styles.submitBtn + " " + styles.help}>
                    <p>Have no account. <Link to='/signup'>create an account</Link></p>
                </div>
            </form>
        </div>
        </NetBackground>
    )
}

export default memo(Login)
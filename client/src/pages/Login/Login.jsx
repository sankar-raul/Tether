import { Link, useNavigate } from 'react-router-dom'
import NetBackground from '../../components/NetBackground/NetBackground'
import styles from './login.module.css'
import { memo, useCallback, useEffect } from 'react'
import apiRequest from '../../hook/apiRequest'
// import useUserInfo from '../../context/userInfo/userInfo' // if use logged in provide user info
import { useForm } from 'react-hook-form'
import useUserInfo from '../../context/userInfo/userInfo'
import useAlert from '../../context/alert/Alert'

const Login = () => {
    const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({
        defaultValues: {
            email: ''
        }
    })
    const { Alert } = useAlert()
    const { setIsLoggedIn, isloggedIn } = useUserInfo()
    const navigate = useNavigate()

    const login = useCallback(async (formData) => {
        console.log(formData)
        const [ data, error ] = await apiRequest('/auth/login', {
            method: "POST",
            body: formData
        })
        if (data) {
            console.log(data)
            if (data.success) {
                setIsLoggedIn(true)
                navigate('/chat')
            }
        } else {
            console.log(error)
            if (error.msg == "incorrect password!") {
                setError('password', {message: "incorrect password"})
            } else if (error.msg == "user not found!") {
                setError('email', {message: 'user not found'})
            }
            Alert({message: error.msg, type: 'error'})
        }
    }, [ navigate, setError, setIsLoggedIn, Alert ])

    useEffect(() => {
        // console.log(isloggedIn)
        if (isloggedIn) {
            navigate('/chat')
        }
    }, [isloggedIn, navigate])

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
                    <button disabled={isSubmitting} style={{'--display-loader': isSubmitting ? 'block' : 'none'}} type="submit">{isSubmitting ? '' : 'Login'}</button>
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

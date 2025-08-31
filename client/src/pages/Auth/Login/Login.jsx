import { Link, useNavigate } from 'react-router-dom'
import styles from './login.module.css'
import { memo, useCallback, useEffect } from 'react'
// import useUserInfo from '../../context/userInfo/userInfo' // if use logged in provide user info
import { useForm } from 'react-hook-form'
import useUserInfo from '../../../context/userInfo/userInfo'
import useAlert from '../../../context/alert/Alert'
import useAuth from '../../../context/auth/auth.context'
import InputBox from '../../../components/InputBox/InputBox'

const Login = () => {
    const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({
        defaultValues: {
            email: ''
        }
    })
    const { login } = useAuth()
    const { Alert } = useAlert()
    const { setIsLoggedIn, isloggedIn, connectSocket } = useUserInfo()
    const navigate = useNavigate()

    const _login = useCallback(async (formData) => {
        // console.log(formData)
        const [ data, error ] = await login({formData})
        if (data) {
            // console.log(data)
            if (data.success) {
                setIsLoggedIn(true)
                connectSocket()
                navigate('/chat')
                Alert({message: "Wellcome " + data?.data?.username + '!', type: 'info'});
            }
        } else {
            // console.log(error)
            if (error.msg == "incorrect password!") {
                setError('password', {message: "incorrect password"})
            } else if (error.msg == "user not found!") {
                setError('email', {message: 'user not found'})
            }
            Alert({message: error.msg, type: 'error'})
        }
    }, [ navigate, setError, setIsLoggedIn, Alert, login ])

    useEffect(() => {
        // console.log(isloggedIn)
        if (isloggedIn) {
            navigate('/chat')
        }
    }, [isloggedIn, navigate])

    return (
        <div className={styles.login}>
            <h1 className={styles.wellcome}>
                Login
            </h1>
            <form className={styles.form} onSubmit={handleSubmit(_login)}>
                <InputBox isError={errors.email} label="Email" type='text' autoComplete='email' register={register("email", {required: { value: true, message: "required" }, pattern: { value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: "invalid email" }})} />
                <InputBox isError={errors.password} label="Password" type='password' autoComplete='password' register={register('password', {required: {value: true, message: "password required"}, minLength: {value: 6, message: "password lengtth must be greater than 6"}})} />
                <div className={styles.forgot}>
                    <Link to='/login/forgot'>forgot password</Link>
                </div>
                <div className={styles.submitBtn}>
                    <button disabled={isSubmitting} style={{'--display-loader': isSubmitting ? 'block' : 'none'}} type="submit">{isSubmitting ? '' : 'Login'}</button>
                </div>
                <div className={styles.submitBtn + " " + styles.help}>
                    <p>Have no account. <Link to='/signup'>create an account</Link></p>
                </div>
            </form>
        </div>
    )
}

export default memo(Login)

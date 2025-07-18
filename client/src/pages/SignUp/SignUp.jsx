import { Link, useNavigate } from "react-router-dom"
import NetBackground from "../../components/NetBackground/NetBackground"
import styles from './signup.module.css'
import { useCallback, useEffect } from "react"
import { useForm } from "react-hook-form"
import useUserInfo from "../../context/userInfo/userInfo"
import useAlert from "../../context/alert/Alert"
import useAuth from "../../context/auth/auth.context"

const SignUp = () => {
    const navigate = useNavigate()
    const { setIsLoggedIn, isloggedIn } = useUserInfo()
    const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({defaultValues: {
        email: ''
    }})
    const { signup } = useAuth()
    const { Alert } = useAlert()
    const _signup = useCallback(async (formData) => {
        const [ data, error ] = await signup({formData})
        if (data) {
            // console.log(data)
            if (data.success) {
                setIsLoggedIn(true)
                navigate('/chat?new_user=true')
                Alert({message: `Hii ${formData.username}!`, type: 'info'});
            }
            // console.log(data)
        } else {
            // console.log(error)
            if (error.msg == "user already exists") {
                setError('email', {message: error.msg})
            }
        }
    }, [navigate, setError, setIsLoggedIn, Alert])

    const showFeedBack = () => {
        if (errors?.email) {
            Alert({message: errors.email.message, type: 'error'})
        }
        if (errors?.password) {
            Alert({message: errors.password.message, type: 'error'})
        }
        if (errors?.username) {
            Alert({message: errors.username.message, type: 'error'})
        }
    }

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
                        Sign Up
                    </h1>
                    <form onSubmit={(e) => {
                        handleSubmit(_signup)(e)
                        showFeedBack()
                    }} className={styles.form}>

                        <div className={styles.inputBox}>
                            <div name={!errors.username ? 'true' : 'incorrect'} className={styles['input-wraper']}>
                                <input {...register('username', {required: {value: true, message: "username required"}, minLength: {value: 3, message: "minimum 3 letter is required"}, maxLength: {value: 30, message: "maximum 30 letters are allowed"}})} autoComplete='nickname' />
                                <label htmlFor='name'>Name</label>
                            </div>
                        </div>

                        <div className={styles.inputBox}>
                            <div name={!errors.email ? 'true' : 'incorrect'} className={styles['input-wraper']}>
                                <input type="text" {...register('email', {required: {value: true, message: "email required"}, pattern: {value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: "invalid email"}})} autoComplete='email' />
                                <label htmlFor='email'>Email</label>
                            </div>
                        </div>

                        <div className={styles.inputBox}>
                            <div name={!errors.password ? 'true' : 'incorrect'} className={styles['input-wraper']}>
                                <input type="password" {...register('password', {required: {value: true, message: "password required"}, minLength: {value: 6, message: "password length must be greater 6"}})} />
                                <label htmlFor='password'>Password</label>
                            </div>
                        </div>
                        
                       <div className={styles.submitBtn}>
                            <button disabled={isSubmitting} style={{'--display-loader': isSubmitting ? 'block' : 'none'}} type="submit">{isSubmitting ? '' : 'Sign up'}</button>
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
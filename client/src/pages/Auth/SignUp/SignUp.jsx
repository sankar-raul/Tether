import { Link, useNavigate } from "react-router-dom"
import styles from './signup.module.css'
import { useCallback, useEffect } from "react"
import { useForm } from "react-hook-form"
import useUserInfo from "../../../context/userInfo/userInfo"
import useAlert from "../../../context/alert/Alert"
import useAuth from "../../../context/auth/auth.context"
import InputBox from "../../../components/InputBox/InputBox"

const SignUp = () => {
    const navigate = useNavigate()
    const { isloggedIn } = useUserInfo()
    const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({defaultValues: {
        email: '',
        password: '',
        
    }})
    const { signup } = useAuth()
    const { Alert } = useAlert()

    const showFeedBack = useCallback(() => {
        console.log(errors)
        if (errors?.email) {
            Alert({message: errors.email.message, type: 'error'})
        }
        if (errors?.password) {
            Alert({message: errors.password.message, type: 'error'})
        }
        if (errors?.username) {
            Alert({message: errors.username.message, type: 'error'})
        }
        if (errors?.fullname) {
            Alert({message: errors.fullname.message, type: 'error'})
        }
    }, [errors, Alert])
    console.log(errors)
    const _signup = useCallback(async (formData) => {
        const [ data, error ] = await signup({formData})
        if (data) {
            const { success, otp_token } = data
            if (success) {
                // setIsLoggedIn(true)
                navigate(`/signup/verify/${otp_token}`)
                // Alert({message: `Hii ${formData.username}!`, type: 'info'});
            }
            // do cose is not success
            // console.log(data)
        } else {
            console.log(error.messages)
            error?.messages?.forEach(msg => {
                setError(msg.field, {message: msg.msg})
               Alert({message: msg.msg, type: 'error'})
            })
        }
    }, [navigate, setError, signup, showFeedBack])

    useEffect(() => {
        // console.log(isloggedIn)
        if (isloggedIn) {
            navigate('/chat')
        }
    }, [isloggedIn, navigate])
    return (
        <div className={styles['signup']}>
            <h1 className={styles.wellcome}>
                Sign Up
            </h1>
            <form onSubmit={async (e) => {
                await handleSubmit(_signup)(e)
                showFeedBack()
            }} className={styles.form}>
                <InputBox isError={errors.email} label="Email" type='text' register={register('email', {required: {value: true, message: "email required"}, pattern: {value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: "invalid email"}})} autoComplete='email' />
                <InputBox isError={errors.fullname} label={"Full Name"} type='text' autoComplete='name' register={register('fullname', {required: {value: true, message: "full name required"}, minLength: {value: 3, message: "minimum 3 letter is required"}, maxLength: {value: 30, message: "maximum 30 letters are allowed"}})} />     
                <InputBox isError={errors.username} label={"username"} type='text' autoComplete='off' register={register('username', {required: {value: true, message: "username required"}, minLength: {value: 3, message: "minimum 3 letter is required"}, maxLength: {value: 30, message: "maximum 30 letters are allowed"}})} />
                <InputBox isError={errors.password} label={"password"} type='password' autoComplete='off' register={register('password', {required: {value: true, message: "password required"}, minLength: {value: 6, message: "password length must be greater 6"}})} />
                        
                <div className={styles.submitBtn}>
                     <button disabled={isSubmitting} style={{'--display-loader': isSubmitting ? 'block' : 'none'}} type="submit">{isSubmitting ? '' : 'Sign up'}</button>
                 </div>
                <div className={styles.submitBtn + " " + styles.help}>
                    <p>Allready have an account. <Link to='/login'>Login here</Link></p>
                </div>
            </form>
        </div>
    )
}

export default SignUp
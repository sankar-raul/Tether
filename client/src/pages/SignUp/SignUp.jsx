import { Link, useNavigate } from "react-router-dom"
import NetBackground from "../../components/NetBackground/NetBackground"
import styles from './signup.module.css'
import { useCallback } from "react"
import apiRequest from "../../hook/apiRequest"
import { useForm } from "react-hook-form"

const SignUp = () => {
    const navigate = useNavigate()
    const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({defaultValues: {
        email: ''
    }})

    const signup = useCallback(async (formData) => {
        const [ data, error ] = await apiRequest('/auth/register', {
            method: "POST",
            body: formData
        })
        if (data) {
            if (data.success) navigate('/chat?new_user=true')
            // console.log(data)
        } else {
            console.log(error)
            if (error.msg == "user already exists") {
                setError('email', {message: "user allready exists"})
            }
        }
    }, [navigate, setError])
  
    return (
        <NetBackground>
                <div className={styles.login}>
                    <h1 className={styles.wellcome}>
                        Sign Up
                    </h1>
                    <form onSubmit={handleSubmit(signup)} className={styles.form}>

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
                            <input disabled={isSubmitting} type="submit" value="Sign Up"/>
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
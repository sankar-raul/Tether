import { Link, useNavigate } from "react-router-dom"
import NetBackground from "../../components/NetBackground/NetBackground"
import styles from './signup.module.css'
import { useCallback, useEffect, useMemo, useState } from "react"
import apiRequest from "../../hook/apiRequest"

const SignUp = () => {
    const [ formData, setFormData ] = useState({})
    const [ isValidData, setISValidData ] = useState({})
    const [ isAllValid, setIsAllValid ] = useState(false)
    const navigate = useNavigate()

    const regex = useMemo(() => /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, [])
    const fields = useMemo(() => new Map([['email', "required"], ['password', "required"], ["username", "required"]]), [])
    
    const handleDataInput = (e) => {
        setFormData(prev => ({...prev, [e.target.name]: e.target.value}))
        if (e.target.name == 'email') {
            setISValidData(prev => ({ ...prev, [e.target.name]: regex.test(e.target.value)}))
        } else if (e.target.name == "password") {
            setISValidData(prev => ({ ...prev, [e.target.name]: e.target.value.length >= 6 }))
        } else {
            setISValidData(prev => ({ ...prev, [e.target.name]: e.target.value.length >= 3 }))
        }
    }
    const signup = useCallback(async (e) => {
        e.preventDefault()
        if (isAllValid) {
            const [ data, error ] = await apiRequest('/auth/register', {
                method: "POST",
                body: formData
            })
            if (data) {
                if (data.success) navigate('/')
                console.log(data)
            } else {
                console.log(error)
                if (error.msg == "user already exists") {
                    setISValidData(prev => ({...prev, email: 'incorrect'}))
                }
            }
        } else {
            fields.forEach((value, key) => {
                if (value == "required") {
                    if (!isValidData[key]) {
                        setISValidData(prev => ({...prev, [key]: 'incorrect'}))
                    }
                }
            })
        }
    }, [formData, fields, isAllValid, isValidData, navigate])
    useEffect(() => {

    }, [formData])
    useEffect(() => {
        setIsAllValid(() => {
            let isValid = true
            fields.forEach((value, key) => {
                // console.log(value, key)
                if (value == "required")
                    isValid *= !!isValidData[key] && isValidData[key] != 'incorrect'
            })
            return !!isValid
        })
        // console.log(isValidData)
    }, [isValidData, fields])
    useEffect(() => {
        // console.log(isAllValid)
    }, [isAllValid])
    return (
        <NetBackground>
                <div className={styles.login}>
                    <h1 className={styles.wellcome}>
                        Sign Up
                    </h1>
                    <form onSubmit={signup} className={styles.form}>
                        <div className={styles.inputBox}>
                            <div name={isValidData.username + ''} className={styles['input-wraper']}>
                                <input onChange={handleDataInput} value={formData['username'] || ''} type="text" id='username' name="username" autoComplete='nickname' />
                                <label htmlFor='name'>Name</label>
                            </div>
                        </div>
                        <div className={styles.inputBox}>
                            <div name={isValidData.email + ''} className={styles['input-wraper']}>
                                <input onChange={handleDataInput} value={formData['email'] || ''} type="text" id='email' name="email" autoComplete='email' />
                                <label htmlFor='email'>Email</label>
                            </div>
                        </div>
                        <div className={styles.inputBox}>
                            <div name={isValidData.password + ''} className={styles['input-wraper']}>
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
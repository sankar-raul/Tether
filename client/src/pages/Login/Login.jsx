import { Link, useNavigate } from 'react-router-dom'
import NetBackground from '../../components/NetBackground/NetBackground'
import styles from './login.module.css'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import apiRequest from '../../service/apiRequest'
import useUserInfo from '../../context/userInfo/userInfo'

const Login = () => {
    const [ formData, setFormData ] = useState({})
    const [ isValidData, setISValidData ] = useState({})
    const [ isAllValid, setIsAllValid ] = useState(false)
    // const { set } = useUserInfo()
    const navigate = useNavigate()

    const regex = useMemo(() => /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, [])
    const fields = useMemo(() => new Map([['email', "required"], ['password', "required"]]), [])
    
    const handleDataInput = (e) => {
        setFormData(prev => ({...prev, [e.target.name]: e.target.value}))
        if (e.target.name == 'email') {
            setISValidData(prev => ({ ...prev, [e.target.name]: regex.test(e.target.value)}))
        } else {
            setISValidData(prev => ({ ...prev, [e.target.name]: e.target.value.length >= 6 }))
        }
    }
    const login = useCallback(async (e) => {
        e.preventDefault()
        if (isAllValid) {
            const [ data, error ] = await apiRequest('/auth/login', {
                method: "POST",
                body: formData
            })
            if (data) {
                if (data.success) navigate('/')
                // console.log(data)
            } else {
                console.log(error)
                if (error.msg == "incorrect password!") {
                    setISValidData(prev => ({...prev, password: 'incorrect'}))
                } else if (error.msg == "user not found!") {
                    setISValidData(prev => ({...prev, email: 'incorrect', password: "incorrect"}))
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
                Login
            </h1>
            <form className={styles.form} onSubmit={login}>
                <div className={styles.inputBox}>
                    <div name={isValidData.email + ''} className={styles['input-wraper']}>
                        <input type="text" onChange={handleDataInput} value={formData['email'] || ''} id='email' autoComplete='email' name='email' />
                        <label htmlFor='email'>Email</label>
                    </div>
                </div>
                <div className={styles.inputBox}>
                    <div name={isValidData.password + ''} className={styles['input-wraper']}>
                        <input type="password" id='password' value={formData['password'] || ''} onChange={handleDataInput} name='password' />
                        <label htmlFor='password'>Password</label>
                    </div>
                </div>
                <div className={styles.forgot}>
                    <Link to='/forgot'>forgot password</Link>
                </div>
                <div className={styles.submitBtn}>
                    <input type="submit" value="Login"/>
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
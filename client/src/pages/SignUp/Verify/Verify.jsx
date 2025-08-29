import { useCallback, useEffect, useRef, useState } from 'react'
import styles from './verify-email.module.css'
import { useNavigate, useParams } from 'react-router-dom'
import useAuth from '../../../context/auth/auth.context'
import useAlert from '../../../context/alert/Alert'
import useUserInfo from '../../../context/userInfo/userInfo'

const RESEND_REST_TIME = 5 // in seconds

const Verify = () => {
    const [ otp, setOtp ] = useState('')
    const interval = useRef(null)
    const { otp_token } = useParams()
    const { varifyOtp, resendOtp } = useAuth()
    const { Alert } = useAlert()
    const [ resendIn, setResendIn ] = useState(RESEND_REST_TIME)
    const { setIsLoggedIn, connectSocket } = useUserInfo()
    const navigate = useNavigate()
    const [ canResend, setCanResend ] = useState(false)
    const [ isResending, setIsResending ] = useState(false)
    const handleInput = (e) => {
        setOtp(e.target.value)
    }
    const resendCounter = useCallback(() => {
        clearInterval(interval.current)
        interval.current = setInterval(() => {
            setResendIn(prev => {
                console.log(prev)
                if (prev <= 1) {
                    clearInterval(interval.current)
                    setCanResend(true)
                    return RESEND_REST_TIME
                } else {
                    return prev - 1
                }
            })
        }, 1000)
    }, [])
    useEffect(() => {
        console.log(otp_token)
    }, [otp_token])
    const handleResendOtp = useCallback(async () => {
        setIsResending(true)
        const [ response, error ] = await resendOtp(otp_token)
        if (error) {
            Alert({
                message: response.msg || "Session Expired!",
                type: 'error'
            })
            return
        }
        if (response?.success) {
            Alert({
                message: "Otp sent successfully!",
                type: 'info'
            })
        } else {
            Alert({
                message: response.msg || "Session Expired!",
                type: 'error'
            })
            navigate('/signup')
        }
        setCanResend(false)
        setIsResending(false)
        resendCounter()
    }, [resendCounter, otp_token, resendOtp, Alert, navigate])
    const handleVarifyOtp = async () => {
        const [ data, error ] = await varifyOtp({otp, otp_token})
        console.log(data, error)
        if (error) {
            console.log(error)
            alert(error)
        }
        if (data?.success) {
            const { access_token, refresh_token } = data.auth_credentials
            localStorage.setItem('access_token', access_token)
            localStorage.setItem('refresh_token', refresh_token)
            setIsLoggedIn(true)
            connectSocket()
            navigate('/chat?new=true')
        } else {
            Alert({message: data?.msg || 'something went wrong!', type:'error'})
        }
    }
    useEffect(() => {
        resendCounter()
    }, [resendCounter])
    return (
        <div className={styles['varify-container']}>
            
            <div className={styles['otp-container']}>
                <div className={styles['varify-otp-header']}>
                    <p>Varify your account</p>
                    <p>We just sent an mail with an otp</p>
                </div>
                <div className={styles['otp-field']}>
                    {/* <input value={otp} type="text" onInput={handleInput} /> */}
                    <input value={'A'} autoFocus className={styles['otp-digit']} />
                    <input value={'A'} className={styles['otp-digit']} />
                    <input value={'A'} className={styles['otp-digit']} />
                    <input value={'A'} className={styles['otp-digit']} />
                    <input value={'A'} className={styles['otp-digit']} />
                    <input value={'A'} className={styles['otp-digit']} />
                </div>
                <div className={styles["actions"]}>
                    <div className={styles['resend-otp']}>
                        { canResend ? <button className={styles['resend-btn']} onClick={handleResendOtp}>{isResending ? "resending otp..." : "resend otp" }</button> : <button>We can resend a new otp in <span>{resendIn}</span> seconds</button> }
                    </div>
                    <div className={styles['varify-btn']}>
                        <button onClick={handleVarifyOtp}>Varify OTP</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Verify
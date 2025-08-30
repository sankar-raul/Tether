import { useCallback, useEffect, useRef, useState } from 'react'
import styles from './verify-email.module.css'
import { useNavigate, useParams } from 'react-router-dom'
import useAuth from '../../../context/auth/auth.context'
import useAlert from '../../../context/alert/Alert'
import useUserInfo from '../../../context/userInfo/userInfo'

const RESEND_REST_TIME = 30 // in seconds

const Verify = () => {
    const interval = useRef(null)
    const { otp_token } = useParams()
    const { verifyOtp, resendOtp } = useAuth()
    const { Alert } = useAlert()
    const [ resendIn, setResendIn ] = useState(RESEND_REST_TIME)
    const { setIsLoggedIn, connectSocket } = useUserInfo()
    const navigate = useNavigate()
    const [ canResend, setCanResend ] = useState(false)
    const [ isResending, setIsResending ] = useState(false)
    const [ isVerifing, setIsVeryFing ] = useState(false)
    const [ verifyStatus, setVerifyStatus ] = useState('default') // default || valid || invalid
    const [ otpDigits, setOtpDigits ] = useState(Array(6))
    const otpFieldRefs = useRef([])
    const [ focusField, setFocusField ] = useState(0)

    const resendCounter = useCallback(() => {
        clearInterval(interval.current)
        interval.current = setInterval(() => {
            setResendIn(prev => {
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
    const handleResendOtp = useCallback(async () => {
        setIsResending(true)
        setVerifyStatus('default')
        otpFieldRefs.current[0].focus()
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
            setOtpDigits(Array(6))
            setFocusField(0)
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

    const handleVerifyOtp = async (e) => {
        e.preventDefault()
        setVerifyStatus('default')
        const otp = otpDigits.join('')
        if (otp.length != 6) {
            setVerifyStatus("invalid")
            Alert({
                message: "Please enter a 6-digit otp",
                type: 'error'
            })
            return
        }
        setIsVeryFing(true)
        const [ data, error ] = await verifyOtp({otp, otp_token})
        setIsVeryFing(false)
        // console.log(data, error)
        if (error) {
            console.log(error)
            // alert(error)
        }
        if (data?.success) {
            setVerifyStatus("valid")
            const { access_token, refresh_token } = data.auth_credentials
            localStorage.setItem('access_token', access_token)
            localStorage.setItem('refresh_token', refresh_token)
            setIsLoggedIn(true)
            connectSocket()
            navigate('/chat?new=true')
        } else {
            setVerifyStatus("invalid")
            Alert({message: data?.msg || 'something went wrong!', type:'error'})
        }
    }

    const handleOtpInput = useCallback((e) => {
        setVerifyStatus('default')
        let { field } = e?.target?.dataset || {}
        let digit =  String(e.target.value?.trim()).toUpperCase()
        // console.log(digit)
        if (digit == '') {
            // setFocusField(field-1)
            console.log(digit)
            // setOtpDigits(prev => {
            // prev[field] = ''
            // // console.log(prev)
            // return [...prev]
            // })
        } else if (digit.length == 1) {
            setOtpDigits(prev => {
            prev[field] = digit
            return [...prev]
            })
            setFocusField(+field+1)
        } else {
            setOtpDigits(prev => {
                if (digit.length == 2) {
                    const prevDigit = prev[field]
                    prev[field] = digit.at(1) != prevDigit ? digit.at(1) : digit.at(0)
                    setFocusField(+field+1 > 5 ? 5 : +field+1)
                } else {
                    const prevDigit = prev[field]
                    let firstLetter
                    if (prevDigit) {
                        if (prevDigit != digit.at(0)?.toLocaleUpperCase()) {
                            firstLetter = digit.at(1)?.toLocaleUpperCase()
                            digit = digit.slice(2)?.toUpperCase()
                        } else {
                            firstLetter = digit.at(1)?.toLocaleUpperCase()
                            digit = digit.slice(0, digit.length - 2)
                        }
                        prev[field] = firstLetter
                    } else {
                        const firstLetter = digit.at(0)?.toLocaleUpperCase()
                        digit = digit.slice(1)?.toUpperCase()
                        prev[field] = firstLetter
                    }
                    for (let letter of digit) {
                        if (field >= 6) break
                        prev[++field] = letter
                        setFocusField(+field+1 > 5 ? 5 : +field+1)
                }
                }
                return [...prev]
            })
        }
    }, [])
    const handleRefAsignment = useCallback((e={}) => {
        const { field } = e?.dataset || {}
        otpFieldRefs.current[+field] = e
    }, [])
    const handleNavigate = useCallback((e) => {
        const { field } = e?.target?.dataset || {}
        if (e.key == 'ArrowLeft') {
            setFocusField(prev => prev <= 0 ? 0 : +prev - 1)
        } else if (e.key == 'ArrowRight') {
            setFocusField(prev =>  prev >= 5 ? 5 : +prev + 1)
        } else if (e.key == 'Backspace') {
               setOtpDigits(prev => {
            prev[field] = ''
            // console.log(prev)
            return [...prev]
            })
            setFocusField(prev => prev <= 0 ? 0 : +prev - 1)
        }
    }, [])
    useEffect(() => {
        // console.log(focusField)
        if (+focusField <= 5 &&  +focusField >= 0) {
            otpFieldRefs.current[focusField]?.focus()
        }
    }, [focusField, otpFieldRefs])
    useEffect(() => {
        resendCounter()
    }, [resendCounter])
    return (
        <form className={styles['verify-container']} onSubmit={handleVerifyOtp}>
            <div className={styles['otp-container']}>
                <div className={styles['verify-otp-header']}>
                    <p>Verify your account</p>
                    <p>We just sent an mail with an otp</p>
                </div>
                <div className={styles['otp-field']} data-status={verifyStatus}>
                    {/* <input value={otp} type="text" onInput={handleInput} /> */}
                    <input autoComplete='off' onKeyDown={handleNavigate} autoCorrect='off' aria-autocomplete='off' ref={handleRefAsignment} autoCapitalize="characters" value={otpDigits.at(0) || ''} data-field={0} onChange={handleOtpInput} className={styles['otp-digit']} />
                    <input autoComplete='off' onKeyDown={handleNavigate} autoCorrect='off' aria-autocomplete='off' ref={handleRefAsignment} autoCapitalize="characters" value={otpDigits.at(1) || ''} data-field={1} onChange={handleOtpInput} className={styles['otp-digit']} />
                    <input autoComplete='off' onKeyDown={handleNavigate} autoCorrect='off' aria-autocomplete='off' ref={handleRefAsignment} autoCapitalize="characters" value={otpDigits.at(2) || ''} data-field={2} onChange={handleOtpInput} className={styles['otp-digit']} />
                    <input autoComplete='off' onKeyDown={handleNavigate} autoCorrect='off' aria-autocomplete='off' ref={handleRefAsignment} autoCapitalize="characters" value={otpDigits.at(3) || ''} data-field={3} onChange={handleOtpInput} className={styles['otp-digit']} />
                    <input autoComplete='off' onKeyDown={handleNavigate} autoCorrect='off' aria-autocomplete='off' ref={handleRefAsignment} autoCapitalize="characters" value={otpDigits.at(4) || ''} data-field={4} onChange={handleOtpInput} className={styles['otp-digit']} />
                    <input autoComplete='off' onKeyDown={handleNavigate} autoCorrect='off' aria-autocomplete='off' ref={handleRefAsignment} autoCapitalize="characters" value={otpDigits.at(5) || ''} data-field={5} onChange={handleOtpInput} className={styles['otp-digit']} />
                </div>
                <div className={styles["actions"]}>
                    <div className={styles['resend-otp']}>
                        { canResend ? <button onClick={handleResendOtp} type='button' className={styles['resend-btn']}>{isResending ? "resending otp..." : "resend otp" }</button> : <button>We can resend a new otp in <span>{resendIn}</span> seconds</button> }
                    </div>
                    <div className={styles['verify-btn']}>
                        <button type='submit' disabled={isVerifing}>{isVerifing ? "Verifying..." : "Verify OTP"}</button>
                    </div>
                </div>
            </div>
        </form>
    )
}
export default Verify
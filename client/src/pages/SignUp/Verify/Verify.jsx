import { useState } from 'react'
import styles from './verify-email.module.css'
import { useNavigate, useParams } from 'react-router-dom'
import useAuth from '../../../context/auth/auth.context'
import useAlert from '../../../context/alert/Alert'
import useUserInfo from '../../../context/userInfo/userInfo'

const Verify = () => {
    const [ otp, setOtp ] = useState('')
    const { otp_token } = useParams()
    const { varifyOtp } = useAuth()
    const { Alert } = useAlert()
    const { setIsLoggedIn, connectSocket } = useUserInfo()
    const navigate = useNavigate()
    const handleInput = (e) => {
        setOtp(e.target.value)
    }
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
            Alert({message: data.msg, type:'error'})
        }
    }
    return (
        <div>
            <div>
                <p>Varify Your Email</p>
                <p>We just sent an email with an otp</p>
            </div>
            <div>
                <input value={otp} type="text" onInput={handleInput} />
            </div>
            <div>
                <button onClick={handleVarifyOtp}>Varify OTP</button>
            </div>
        </div>
    )
}
export default Verify
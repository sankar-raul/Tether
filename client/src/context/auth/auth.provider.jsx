import { useCallback, useEffect, useState } from "react"
import { AuthContext } from "./auth.context"
import PropTypes from 'prop-types'
import Auth from "../../hook/auth"

const AuthProvider = ({children}) => {
    const [ isLoggedin, setIsLoggedIn ] = useState()

    const logout = useCallback(async () => {
        const [ logoutResponse, error ] = await Auth.logout()
        return [ logoutResponse, error ]
    }, [])
    const login = useCallback(async ({formData}) => {
        const [ loginResponse, error ] = await Auth.login({formData})
        return [ loginResponse, error ]
    }, [])
    const signup = useCallback(async ({formData}) => {
        const [ signupResponse, error ] = await Auth.signup({formData})
        return [ signupResponse, error ]
    }, [])
    const varifyOtp = useCallback(async ({otp, otp_token}) => {
        const [ otpCheckResponse, error ] = await Auth.varifyOtp({otp, otp_token})
        return [ otpCheckResponse, error ]
    }, [])
    useEffect(() => {

    }, [])
    return (
        <AuthContext.Provider value={{isLoggedin, logout, login, signup, varifyOtp}}>
            {children}
        </AuthContext.Provider>
    )
}
AuthProvider.propTypes = {
    children: PropTypes.node.isRequired
}
export default AuthProvider
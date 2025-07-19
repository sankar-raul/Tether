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
    const refreshToken = useCallback(async () => {
        const response = await Auth.refreshToken()
        return response
    }, [])
    useEffect(() => {

    }, [])
    return (
        <AuthContext.Provider value={{isLoggedin, logout, login, signup, refreshToken}}>
            {children}
        </AuthContext.Provider>
    )
}
AuthProvider.propTypes = {
    children: PropTypes.node.isRequired
}
export default AuthProvider
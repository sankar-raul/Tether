import PropTypes from 'prop-types'
import { userInfoContext } from './userInfo'
import { useCallback, useEffect, useState } from 'react'
import apiRequest from '../../hook/apiRequest'
import useTokenWorker from '../../backgroundWorker/hooks/useTokenWorker'
import socket from '../../utils/chatSocket'

const UserInfoProvider = ({ children }) => {
    const [ userInfo, setUserInfo ] = useState(null)
    const [ isloggedIn, setIsLoggedIn ] = useState()
    const [ accessToken, setAccessToken ] = useState(null)
    const [ access_token, handleCanRefresh, { isValid, msg } ] = useTokenWorker()
    
    const logout = useCallback(() => {
        setIsLoggedIn(false)
        setUserInfo(null)
        socket.disconnect()
    }, [])

    const getUserInfo = useCallback(async () => {
        if (!isloggedIn) {
            if (isValid === null) return
            if (!isValid) {
                setIsLoggedIn(false)
                handleCanRefresh()
                return
            }
        }
        const [ userData, error ] = await apiRequest('/user')
        if (userData) {
            handleCanRefresh(true)
            setUserInfo(userData.user)
            setIsLoggedIn(true)
        } else {
            setIsLoggedIn(false)
            // console.log(error)
        }
    }, [isValid, handleCanRefresh, isloggedIn])
    useEffect(() => {
        isValid !== null && !isValid && setIsLoggedIn(false)
    }, [isValid])
    useEffect(() => {
        msg == 'no auth' && handleCanRefresh(false)
    }, [msg, handleCanRefresh])
    useEffect(() => {
        access_token ?? setAccessToken(access_token)
    }, [access_token])

    useEffect(() => {
        userInfo || getUserInfo()

    }, [isloggedIn, getUserInfo, userInfo])
    // useEffect(() => {
    //     console.log(isloggedIn)
    // }, [isloggedIn])
    return (
        <userInfoContext.Provider value={{userInfo, isloggedIn, setIsLoggedIn, accessToken, logout}}>
            {children}
        </userInfoContext.Provider>
    )
}
UserInfoProvider.propTypes = {
    children: PropTypes.node
}

export default UserInfoProvider
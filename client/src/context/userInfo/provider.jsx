import PropTypes from 'prop-types'
import { userInfoContext } from './userInfo'
import { useCallback, useEffect, useState } from 'react'
import apiRequest from '../../hook/apiRequest'
import useTokenWorker from '../../backgroundWorker/hooks/useTokenWorker'

const UserInfoProvider = ({ children }) => {
    const [ userInfo, setUserInfo ] = useState(null)
    const [ isloggedIn, setIsLoggedIn ] = useState()
    const [ token ] = useTokenWorker()
    
    const getUserInfo = useCallback(async () => {
        const [ userData, error ] = await apiRequest('/user')
        if (userData) {
            setUserInfo(userData.user)
            setIsLoggedIn(true)
        } else {
            setIsLoggedIn(false)
            console.log(error)
        }
    }, [])
    useEffect(() => {
        userInfo || getUserInfo()

    }, [isloggedIn, getUserInfo, userInfo])
    return (
        <userInfoContext.Provider value={{userInfo, isloggedIn, setIsLoggedIn}}>
            {children}
        </userInfoContext.Provider>
    )
}
UserInfoProvider.propTypes = {
    children: PropTypes.node
}

export default UserInfoProvider
import PropTypes from 'prop-types'
import { userInfoContext } from './userInfo'
import { useCallback, useEffect, useState } from 'react'
import apiRequest from '../../hook/apiRequest'

const UserInfoProvider = ({ children }) => {
    const [ userInfo, setUserInfo ] = useState(null)
    const [ isloggedIn, setIsLoggedIn ] = useState(false)
    
    const getUserInfo = useCallback(async () => {
        const [ userData, error ] = await apiRequest('/user')
        if (userData) {
            setUserInfo(userData.user)
            setIsLoggedIn(true)
        } else {
            console.log(error)
        }
    }, [])
    useEffect(() => {
        getUserInfo()
    }, [isloggedIn, getUserInfo])
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
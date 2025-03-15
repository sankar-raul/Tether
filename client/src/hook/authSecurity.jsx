import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import useUserInfo from '../context/userInfo/userInfo'
import { useEffect } from 'react'
import socket from '../utils/chatSocket'

export const ProtectedRoute = ({children}) => {
    const navigate = useNavigate()
    const { isloggedIn } = useUserInfo()

    useEffect(() => {
        if (!isNaN(isloggedIn) && !isloggedIn) {
            navigate('/login', { replace: true })
        }
        console.log(isloggedIn)
    }, [isloggedIn, navigate])
    useEffect(() => {
        if (isloggedIn && socket.disconnected) {
            socket.connect()
        }
    }, [isloggedIn])
    return (
        <>
            {children}
        </>
    )
}
ProtectedRoute.propTypes = {
    children: PropTypes.node
}
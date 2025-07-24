import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import useUserInfo from '../context/userInfo/userInfo'
import { useEffect } from 'react'

export const ProtectedRoute = ({children}) => {
    const navigate = useNavigate()
    const { isloggedIn } = useUserInfo()

    useEffect(() => {
        if (!isNaN(isloggedIn) && !isloggedIn) {
            navigate('/login', { replace: true })
        }
        // console.log(isloggedIn)
    }, [isloggedIn, navigate])
    return (
        <>
            {children}
        </>
    )
}
ProtectedRoute.propTypes = {
    children: PropTypes.node
}
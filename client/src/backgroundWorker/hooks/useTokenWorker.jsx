import { useCallback, useEffect, useRef, useState } from "react"
import { refresh } from "../workers/refresh_access_token"

const REFRESH_INTERVAL = 13 * 60 * 1000

const useTokenWorker = () => {
    const [ access_token, setAccessToken ] = useState(null)
    const [ isValid, setIsValid ] = useState(null)
    const [ msg, setMsg ] = useState(null)
    const [ isBlocked, setIsBlocked ] = useState(true)
    const timeoutRef = useRef()

    const refreshAccessToken = useCallback(async () => {
        const { success, token, error } = await refresh()
        // console.log(success, token, error)
        if (success) {
            // console.log(token)
            setAccessToken(token)
            setIsValid(true)
        } else {
            if (error == 'net error') {
                setTimeout(refreshAccessToken, 5000) // retry
            } else if (error == 'no auth') {
                setIsValid(false)
            } else {
                // unknown error message
                // logout
                setIsValid(false)
            }
            error && setMsg(error) // no auth || net error ||📍 - 😆
            // msg && console.log(error)
        }
    }, [])

    const handleCanRefresh = useCallback((can) => {
        setIsBlocked(can)
    }, [])

    useEffect(() => {
        refreshAccessToken()
        if (isBlocked)
            timeoutRef.current = setInterval(refreshAccessToken, REFRESH_INTERVAL)
        else
            clearTimeout(timeoutRef.current)
        return () => clearInterval(timeoutRef.current)
    }, [refreshAccessToken, isBlocked])

    return [access_token, handleCanRefresh, {isValid, msg}]
}
export default useTokenWorker
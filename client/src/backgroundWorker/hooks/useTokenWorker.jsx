import { useCallback, useEffect, useState } from "react"
import { refresh } from "../workers/refresh_access_token"

const REFRESH_INTERVAL = 13 * 60 * 1000

const useTokenWorker = () => {
    const [ access_token, setAccessToken ] = useState(null)

    const refreshAccessToken = useCallback(() => {
        const { success, token, msg } = refresh()
        if (success) {
            // console.log(token)
            setAccessToken(token)
        } else {
            msg && console.log(msg)
        }
    }, [])

    useEffect(() => {
        refreshAccessToken()
        const interval = setInterval(refreshAccessToken, REFRESH_INTERVAL)
        return () => clearInterval(interval)
    }, [refreshAccessToken])

    return [ access_token ]
}
export default useTokenWorker
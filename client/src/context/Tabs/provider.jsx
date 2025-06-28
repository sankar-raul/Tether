import { useEffect, useState } from "react"
import { tabsContext } from "./tabs"
import PropTypes from 'prop-types'
import { useNavigate } from "react-router-dom"
const TabsProvider = ({children}) => {
    const [ currentTab, setCurrentTab ] = useState('chat')
    const navigate = useNavigate()

    useEffect(() => {
        // if (!currentTab) return
        // switch (currentTab) {
        //     case 'chat':
        //         navigate('/chat')
        //         break
        //     case 'call':
        //         navigate('/chat/calls')
        //         break
        //     case 'settings':
        //         navigate('/chat/settings')
        //         break
        //     default:
        //         console.log("What")
        //         break
        // }
    }, [currentTab, navigate])
    useEffect(() => {
        // find the cauurent tab from the url
    }, [])
    return (
        <tabsContext.Provider value={{currentTab, setCurrentTab}}>
            {children}
        </tabsContext.Provider>
    )
}
export default TabsProvider
TabsProvider.propTypes = {
    children: PropTypes.node.isRequired
}
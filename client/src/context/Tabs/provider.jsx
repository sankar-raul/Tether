import { useState } from "react"
import { tabsContext } from "./tabs"
import PropTypes from 'prop-types'
const TabsProvider = ({children}) => {
    const [ currentTab, setCurrentTab ] = useState('chat')

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
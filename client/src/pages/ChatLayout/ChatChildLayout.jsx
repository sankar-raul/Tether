import { useLocation, useOutlet } from 'react-router-dom'
import Contacts from '../../components/Contacts/Contacts'
import Tabs from '../../components/Tabs/Tabs'
import ResizeableAsideProvider from '../../context/resizeableAside/provider'
import styles from './chatlayout.module.css'
import RightContainer from '../../components/RightContainer/RightContainer'
import DefaultChatView from '../../components/ChatBox/DefaultView/DefaultView'

const chatChildlayout = ({CurrentTabComponent, hideContactBtn = false}) => {
    const outlet = useOutlet()
    const location = useLocation()

    return (
        <section className={styles['chat-view']}>
            <ResizeableAsideProvider>
            <aside className={styles['left-side']}>
            <Tabs />
            <Contacts hideContactBtn={hideContactBtn}>
                <CurrentTabComponent />
            </Contacts>
            </aside>
            </ResizeableAsideProvider>
            <RightContainer isHidden={!outlet || location.pathname == '/chat/settings' }>
                {outlet || <DefaultChatView />}
            </RightContainer>
        </section>
    )
}
export default chatChildlayout
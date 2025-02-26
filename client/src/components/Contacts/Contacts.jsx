import { useCallback, useEffect, useState } from 'react'
import useResize from '../../context/resizeableAside/resizeableAside'
import styles from './contacts.module.css'
import PropTypes from 'prop-types'
import useContacts from '../../context/contacts/contact'
import useTabs from '../../context/Tabs/tabs'
import { HeroDate } from '../../utils/date'
import apiRequest from '../../hook/apiRequest'
import useUserInfo from '../../context/userInfo/userInfo'

const Contacts = () => {
    const { resizeableDiv, handleMouseDown } = useResize()
    const { currentTab } = useTabs()

    return (
        <div className={styles['contacts-wraper']}>
            <div ref={resizeableDiv}  className={styles['contacts']}>
                {
                    currentTab == 'chat' ? <Chats /> : <Calls />
                }
            </div>
            <div onMouseDown={handleMouseDown} className={styles['handle-resize']}></div>
        </div>
    )
}
export default Contacts

const Calls = () => {

    return (
        <h1>Calls</h1>
    )
}
const Chats = () => {
    const { contactMap } = useContacts()
    return (
        <>
        {
            [...contactMap.values()]?.map(user => (
                <Contact key={user?.id} user={user} />
            ))
        }
        </>
    )
}

const Contact = ({ user }) => {
    const [ isActive, setIsActive ] = useState(false)
    const { selectedContact, setSelectedContact, updateContactInfo } = useContacts()
    const [ timestamp, setTimeStamp ] = useState('')
    const [ userInfo, setUserInfo ] = useState({})
    const [ lastMessage, setLastMessage ] = useState(null)
    const [ isChatingWithMyself, setIsChatingWithMyself ] = useState(false)
    const { userInfo:localUserInfo } = useUserInfo()

    const togglwActive = useCallback(() => {
        setSelectedContact(Number(user?.id))
    }, [user, setSelectedContact])
    
    const lastMsg = useCallback(async () => {
        if (lastMessage || !userInfo?.id) return
        const [ res, error ] = await apiRequest(`/chat/lastMessage/${userInfo?.id}`)
        if (!error) {
            // console.log(res.data)
            if (res?.data) {
                setLastMessage(res.data)
                updateContactInfo(Number(userInfo.id), {unread: res.data.unread})
            } else {
                setLastMessage(userInfo?.bio)
            }
        }
    }, [setLastMessage, userInfo, lastMessage, updateContactInfo])

    // useEffect(() => {
    //     setUserInfo(contactMap?.get(user?.id))
    // }, [user])
    useEffect(() => {
        if (lastMessage) {
            userInfo.content && setLastMessage(userInfo.content)
        } else {
            lastMsg()
        }
    }, [userInfo, lastMsg, lastMessage])
    useEffect(() => {
        localUserInfo && userInfo && setIsChatingWithMyself(localUserInfo.id == userInfo.id)
    }, [localUserInfo, userInfo])
    useEffect(() => {
        setUserInfo({...user, id: Number(user.id)})
        const lastMsgDate = new HeroDate(user.last_msg_at)
        const prevDayStart = new HeroDate()
        const prevMidNight = new HeroDate()
        prevMidNight.setHours(0,0,0,0)
        prevDayStart.setHours(0,0,0,0)
        prevMidNight.setDate(prevMidNight.getDate() - 1)
        prevDayStart.setDate(prevDayStart.getDate() - 2)
        if (prevMidNight.getTime() < lastMsgDate.getTime()) {
            setTimeStamp(lastMsgDate.formatedTime())
            // console.log(prevMidNight.getTime(), lastMsgDate.getTime())
            // console.log(prevMidNight.formatedDate(), prevMidNight.formatedTime())
            // console.log(lastMsgDate.formatedDate(), lastMsgDate.formatedTime())
        } else if (prevDayStart.getTime() < lastMsgDate.getTime()) {
            setTimeStamp('yesterday')
        } else {
            setTimeStamp(lastMsgDate.formatedDate())
        }
        // console.log(user)
        // console.log(prevDayStart.formatedDate(), prevDayStart.formatedTime(), prevMidNight.formatedDate(), prevMidNight.formatedTime())
    }, [user])
    
    useEffect(() => {
        // console.log(selectedContact, user.id)
        setIsActive(selectedContact === Number(user.id))
    }, [selectedContact, user])
    return (
        <div onClick={togglwActive} className={`${styles['contact']} ${isActive ? styles['active'] : ''}`}>
            <div className={styles['profile']}>
                <img src={userInfo?.profile_pic_url || "/me.jpg"} alt="user" />
            </div>
            <div className={styles['user-info']}>
                <div className={styles['user-meta-data']}>
                    <div className={styles['username']}>{`${userInfo?.username}${isChatingWithMyself ? ' (You)' : ''}`}</div>
                    <div className={styles['last-msg']}>
                        {lastMessage?.content || lastMessage}
                    </div>
                </div>
                <div className={styles['user-status']}>
                    <div className={styles['last-msg-time']}>
                        {timestamp}
                    </div>
                    <div className={styles['unread-msg-count']}>
                        {userInfo?.unread && userInfo.unread > 0 ?
                        <div><p>{userInfo?.unread}</p></div> : ''}
                    </div>
                </div>
            </div>
        </div>
    )
}
Contact.propTypes = {
    user: PropTypes.object.isRequired,
    active: PropTypes.bool
}
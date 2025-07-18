import { useCallback, useEffect, useState } from "react"
import socket from '../utils/chatSocket'
import apiRequest from "./apiRequest"
import useContacts from "../context/contacts/contact"
import NotifyTone from "../utils/notificationSound"
import useAlert from "../context/alert/Alert"
import useUserInfo from "../context/userInfo/userInfo"

const messageRef = new Map() // contact_id -> local_id -> message_object
const unreadMsgRef = new Map() // contact_id -> int
const msgIdToLocalIdRef = new Map() // msg_id -> local_id
const nextMsgChunkEndpoint = new Map() // contact_id -> endpoint

const getUniqeMessageId = (...args) => {
    const uniqueId = `${String(args)}+${Date.now()}+${Math.random()}`
    return uniqueId
}

const incrementUnread = (id, value) => {
    if (value == 0) {
        unreadMsgRef.set(id, 0)
        return
    }
    if (unreadMsgRef.has(id)) {
        unreadMsgRef.set(id, unreadMsgRef.get(id) + value)
    } else {
        unreadMsgRef.set(id, 1)
    }
    // console.log(unreadMsgRef)
}

let timeout
const useMsgSocket = (contactId) => {
    const [ messages, setMessages ] = useState(new Map()) // contact_id -> message_id -> message_object
    const [ seenMap, setSeenMap ] = useState(new Map()) // contact_id -> boolean
    const { shiftUpContact, updateContactInfo, selectedContact, fetchContactInfo } = useContacts()
    const { Alert } = useAlert()
    const [ isLoading, setIsLoading ] = useState({state: true, for: contactId})
    const [ nextMsgChunk, setNextMsgChunk ] = useState(new Map())
    const [ isTyping, setIsTyping ] = useState(false)
    const { isloggedIn } = useUserInfo()

    const handleTyping = useCallback(() => {
        setIsTyping(true)
        clearTimeout(timeout)
        timeout = setTimeout(() => setIsTyping(false), 1000)
    }, [])

    const deleteMsg = (reciver, msg_id) => {
        // console.log(reciver, msg_id)
        if (!msg_id || !reciver || !messageRef.has(reciver)) return
        try {
            const response = socket.emitWithAck("message:delete", {msg_id})
            // do some work with the response here
            const messageMap = messageRef.get(reciver)
            const local_id = msgIdToLocalIdRef.get(msg_id)
            messageMap.delete(local_id)
            messageRef.set(reciver, messageMap)
            setMessages(new Map(messageRef))
            msgIdToLocalIdRef.delete(msg_id)
        } catch (error) {
            console.log("Socket Error : ", error)
        }
    }

    const seeMsg = useCallback((contact_id) => { // ok
        // console.log(contactId, "oppppp")
        if (!contact_id) return
        contact_id = Number(contact_id)
        if (!messageRef.has(contact_id)) return
        try {
            socket.emit('message:see', { sender: contact_id })
            updateContactInfo(contact_id, {unread: 0})
            const messageMap = messageRef.get(contact_id)
            messageMap.forEach((msg, key) => {
                if (!msg.seen_at && msg.sender == contact_id) {
                    messageMap.set(key, {...msg, seen_at: new Date().toISOString()})
                }
            })
            messageRef.set(contact_id, messageMap)
            setMessages(new Map(messageRef))
            incrementUnread(contact_id, 0)
        } catch (error) {
            console.log("Error while seeing messages", error)
            Alert({message: "Error while seeing messages", type: "error"})
        }
    }, [updateContactInfo, Alert])

    // get past conversations
    const constructMessages = useCallback(({response, id}) => {
        let local_id
        const messageMap = new Map()
        response?.data?.forEach(msg => {
            if (msg.sender == id && !msg.seen_at) {
                incrementUnread(id, 1)
            }
            local_id = getUniqeMessageId(id)
            messageMap.set(local_id, msg)
            msgIdToLocalIdRef.set(msg.id, local_id)
        })
        
        nextMsgChunkEndpoint.set(id, response.next) // for track load more msg
        setNextMsgChunk(new Map(nextMsgChunkEndpoint))
        // console.log(messageMap, "op")
        updateContactInfo(id, {unread: unreadMsgRef.get(id)})
        return messageMap
    }, [updateContactInfo])

    const loadMoreMsg = useCallback(async ({id}) => {
        // console.log("i am here")
        let uri = nextMsgChunkEndpoint.get(id)
        if (!uri) return
        try {
        const [response, error] = await apiRequest(uri)
        if (error) throw new Error(error)
        messageRef.set(id, new Map([...constructMessages({response, id}), ...messageRef.get(id)]))
        setMessages(new Map(messageRef))
        } catch (error) {
            console.log("Error in useMsgSocket.jsx loadMore function 🐞", error)
        }

    }, [constructMessages])

    const getInitialMessages = useCallback(async (id, config = {}) => { // ok
        id = Number(id)
        const { feedback } = config
        // console.log(id, "opp")
        if (!id || messageRef.has(id)) return
  
        feedback && setIsLoading(prev => ({...prev, for: id, state: true}))
        const [[response, error], ] = await Promise.all([apiRequest(`/chat/messages/${id}`), fetchContactInfo(id)])
        feedback && setIsLoading(prev => ({...prev, for: id, state: false}))
        if (!error) {
            // console.log(response)
            // console.log(response)
            messageRef.set(id, constructMessages({response, id}))
            setMessages(new Map(messageRef))
        }
    }, [updateContactInfo, constructMessages])

    useEffect(() => {
        // console.log(contactId)
        contactId && getInitialMessages(contactId, {feedback: true})
    }, [contactId, getInitialMessages])

    // send message to selected contact
    const sendMsg = useCallback(async (content) => { // ok
        content = content.trim()
        if (content) {
            try {
                const local_id = getUniqeMessageId(contactId)
                const messageMap = new Map(messageRef.get(contactId))
                // *****************************
                // message sent pending status update 
                const sent_at = new Date().toISOString();
                const msg = {
                    content,
                    sent_at,
                    reciver: contactId,
                    tick: 0,
                    edited_at: null,
                    sender: null,
                    id: null,
                    recived_at: null,
                    seen_at: null
                }
                messageMap.set(local_id, msg)
                messageRef.set(contactId, messageMap)
                setMessages(new Map(messageRef))
                shiftUpContact(contactId, msg)
                // *^^^^^^^^^^^^^^^^^^^^^^^^^^^^*
                const message = await socket.emitWithAck('message:send', {content, reciver: contactId, sent_at})
                if (message == 'error') {
                    console.log("message send error!")
                    Alert({message: "Something went wrong!", type: 'error'})
                } else {
                    // console.log(message)
                    // setTimeout(() => {
                    const msgMap = new Map(messageRef.get(contactId))
                    msgIdToLocalIdRef.set(message.id, local_id)
                    // console.log(message)
                    // Object.assign(msg, message)
                    // console.log(msg, message)
                    msg.tick = message.tick
                    msg.recived_at = message.recived_at
                    msg.seen_at = message.seen_at
                    msg.id = message.id
                    msg.sender = message.sender
                    msgMap.set(local_id, msg)
                    messageRef.set(contactId, msgMap)
                    setMessages(new Map(messageRef))
                    NotifyTone.sent()
                // }, 2000)
            }
            } catch (error) {
                console.log("Error sending message", error)
                Alert({message: "Something went wrong!", type: 'error'})
            }
        }
    }, [contactId, shiftUpContact, Alert])
    const emitTypingStatus = useCallback((typing) => {
        socket.emit('isTyping', {isTyping: typing, chatingWith: contactId})
    }, [contactId])

     useEffect(() => {
        // console.log(isTyping)
        emitTypingStatus(isTyping)
    }, [isTyping, emitTypingStatus])

    useEffect(() => {
        if (!isloggedIn) {
            messageRef.clear()
            setMessages(new Map())
            unreadMsgRef.clear()
            msgIdToLocalIdRef.clear()
            nextMsgChunkEndpoint.clear()
            setNextMsgChunk(new Map())
            setSeenMap(new Map())
        }
    }, [isloggedIn])

    useEffect(() => {
        // sync messages across all this users clients
        const syncMsg = (message) => {
            let { reciver } = message
            reciver = Number(reciver)
            if (!messageRef.has(reciver)) {
                getInitialMessages(reciver)
            }
            const local_id = getUniqeMessageId(message.sender, message.reciver)
            
            msgIdToLocalIdRef.set(message.id, local_id)
            const messageMap = messageRef.get(reciver) || new Map()
            messageMap.set(local_id, {...message, local_id})
            messageRef.set(reciver, messageMap)
            setMessages(new Map(messageRef))
            shiftUpContact(reciver, message)
            NotifyTone.sent()
            // Alert({message: message.content, type: 'info'})

        }

        // push new message to message Map
        const msgRecived = (message) => { // op
            // console.log(message)
            // console.log(message.id, contactId, 'sankar')
            let { sender } = message
            sender = Number(sender)
            if (!messageRef.has(sender)) {
                getInitialMessages(sender)
            } else {
                selectedContact != sender && incrementUnread(sender, 1)
            }
            if (selectedContact == sender) {
                seeMsg(sender) // see msg if selected contact == sender
            }
            const local_id = getUniqeMessageId(message.sender, message.reciver)
            // console.log(sender)
            // console.log(message)
            msgIdToLocalIdRef.set(message.id, local_id)
            const messageMap = messageRef.get(sender) || new Map()
            messageMap.set(local_id, {...message, local_id})
            messageRef.set(sender, messageMap)
            setMessages(new Map(messageRef))
            shiftUpContact(sender, {...message, unread: unreadMsgRef.get(sender)})
            if (selectedContact == sender)
                NotifyTone.sent()
            else {
                NotifyTone.recive()
                // Alert({message: message.content, type: 'info'})
            }
        }

        // delete a single message by msg_id
        const msgDeleted = ({msg_id, sender, sync}) => { // op
            sender = Number(sender)
            const local_id = msgIdToLocalIdRef.get(Number(msg_id))
            if (!messageRef.has(sender) || !messageRef.get(sender).has(local_id)) {
                return
            }
            const messageMap = new Map(messageRef.get(sender))
            if (messageMap.get(local_id).tick < 3) {
                incrementUnread(sender, -1)
                updateContactInfo(sender, {unread: unreadMsgRef.get(sender)})
            }
            messageMap.delete(local_id)
            messageRef.set(sender, messageMap)
            setMessages(new Map(messageRef))
            msgIdToLocalIdRef.delete(Number(msg_id))
        }

        const seenAll = async (seen_at, reciver, sync) => { // op
            reciver = Number(reciver)
            // console.log(reciver)
            // console.log(messageRef.has(reciver), messageRef.get(reciver))
            if (!messageRef.has(reciver)) return
            setSeenMap(prev => prev.set(reciver, true))
            const messageMap = messageRef.get(reciver)
            if (sync) {
                incrementUnread(reciver, 0)
                updateContactInfo(reciver, {unread: unreadMsgRef.get(reciver)})

            }
            messageMap.forEach((msg, key) => {
                if (!msg.seen_at && (sync ? msg.sender : msg.reciver) == reciver) {
                    // console.log(seen_at)
                    messageMap.set(key, {...msg, seen_at})
                }
            })
            messageRef.set(reciver, messageMap)
            // console.log(messageRef)
            setMessages(new Map(messageRef))
        }

        // seen all messages for a specific contact
        const msgSeen = ({reciver, seen_at, sync}) => { // op
            seenAll(seen_at, reciver, sync)
        }

        // edit message content by msg_id for a specific contact
        const msgEdited = ({msg_id, newContent, edited_at, sender}) => { // op
            sender = Number(sender)
            const local_id = msgIdToLocalIdRef.get(Number(msg_id))
            if (!messageRef.has(sender) || !messageRef.get(sender).has(local_id)) return
            const messageMap = new Map(messageRef.get(sender))
            messageMap.set(local_id, {...messageMap.get(local_id), content: newContent, edited_at})
            messageRef.set(sender, messageMap)
            setMessages(new Map(messageRef))
        }

        // update message status based on tick 1|2|3
        const msgStatus = ({msg_id, tick, reciver, recived_at}) => { // op
            reciver = Number(reciver)
            const local_id = msgIdToLocalIdRef.get(Number(msg_id))
            if (!messageRef.has(reciver) || !messageRef.get(reciver).has(local_id)) return
            const messageMap = new Map(messageRef.get(reciver))
            messageMap.set(local_id, {...messageMap.get(local_id), tick, recived_at})
            messageRef.set(reciver, messageMap)
            setMessages(new Map(messageRef))
        }

        // delete all messages from message Map for given contact
        const msgDeletedAll = ({sender}) => { // op
            sender = Number(sender)
            if (!messageRef.has(sender)) return
            const messageMap = messageRef.get(sender)
            messageMap.forEach((msg, key) => {
                msgIdToLocalIdRef.delete(msg.id)
                messageMap.delete(key)
            })
            messageRef.set(sender, messageMap)
            // messageRef.delete(sender)
            setMessages(new Map(messageRef))
        }

        // listen for undeliverd messages
        const waitedMessages = (messages) => { // done
            messages.forEach(msgRecived)
        }

        // track user typing status
        const typingStatus = ({user_id, isTyping}) => {
            // console.log(user_id, isTyping, "drgsgar")
            updateContactInfo(user_id, { isTyping }, {
                newEntry: false
            })
        }
        // listen for messages
        socket.on('waited:messages', waitedMessages)
        socket.on('message:recive', msgRecived)
        socket.on('message:sync', syncMsg)
        socket.on('message:deleted', msgDeleted)
        socket.on('message:seen', msgSeen)
        socket.on('message:edited', msgEdited)
        socket.on('message:status', msgStatus)
        socket.on('message:deleted:all', msgDeletedAll)
        socket.on('typing-status', typingStatus)
        return () => {
            // removing message events
            socket.off('waited:messages', waitedMessages)
            socket.off('message:recive', msgRecived)
            socket.off('message:sync', syncMsg)
            socket.off('message:deleted', msgDeleted)
            socket.off('message:seen', msgSeen)
            socket.off('message:edited', msgEdited)
            socket.off('message:status', msgStatus)
            socket.off('message:deleted:all', msgDeletedAll)
            socket.off('typing-status', typingStatus)
        }
    }, [contactId])
    return {messages, handleTyping, seenMap, sendMsg, seeMsg, deleteMsg, isLoading, loadMoreMsg, nextMsgChunk}
}
export default useMsgSocket
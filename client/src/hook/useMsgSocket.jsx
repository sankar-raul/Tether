import { useCallback, useEffect, useState } from "react"
import socket from '../utils/chatSocket'
import apiRequest from "./apiRequest"
import useContacts from "../context/contacts/contact"
import NotifyTone from "../utils/notificationSound"

const messageRef = new Map() // contact_id -> message_id -> message_object
const unreadMsgRef = new Map() // contact_id -> int

const incrementUnread = (id, value) => {
    if (value == -1) {
        unreadMsgRef.set(id, 0)
        return
    }
    if (unreadMsgRef.has(id)) {
        unreadMsgRef.set(id, unreadMsgRef.get(id) + value)
    } else {
        unreadMsgRef.set(id, 1)
    }
    console.log(unreadMsgRef)
}

const useMsgSocket = (contactId) => {
    const [ messages, setMessages ] = useState(new Map()) // contact_id -> message_id -> message_object
    const [ seenMap, setSeenMap ] = useState(new Map()) // contact_id -> boolean
    const { shiftUpContact, updateContactInfo, selectedContact } = useContacts()


    const seeMsg = useCallback((id) => {
        if (!id) return
        console.log(id, "dfdfd")
        id = Number(id)
        if (!messageRef.has(id)) return
        try {
            socket.emit('message:see', { sender: id })
            updateContactInfo(id, {unread: 0})
            const messageMap = messageRef.get(id)
            messageMap.forEach((msg, key) => {
                if (!msg.seen_at && msg.sender == id) {
                    messageMap.set(key, {...msg, seen_at: new Date().toISOString()})
                }
            })
            messageRef.set(id, messageMap)
            setMessages(new Map(messageRef))
            incrementUnread(id, -1)
        } catch (error) {
            console.log("Error while seeing messages", error)
        }
    }, [updateContactInfo])

    // get past conversations
    const getInitialMessages = useCallback(async (id) => {
        id = Number(id)
        // console.log(id, "opp")
        if (!id || messageRef.has(id)) return
        const [response, error] = await apiRequest(`/chat/messages/${id}`)
        if (!error) {
            const messageMap = new Map()
            response.forEach(msg => {
                if (msg.sender == id && !msg.seen_at) {
                    incrementUnread(id, 1)
                }
                messageMap.set(msg.id, msg)
            })
            console.log(unreadMsgRef.get(id))
            updateContactInfo(id, {unread: unreadMsgRef.get(id)})
            // console.log(response)
            messageRef.set(id, messageMap)
            setMessages(new Map(messageRef))
        }
    }, [updateContactInfo])

    useEffect(() => {
        console.log(contactId)
        contactId && getInitialMessages(contactId)
    }, [contactId, getInitialMessages])

    // send message to selected contact
    const sendMsg = useCallback(async (content) => {
        content = content.trim()
        if (content) {
            try {
                const message = await socket.emitWithAck('message:send', {content, reciver: contactId})
                if (message == 'error') {
                    console.log("message send error!")
                } else {
                    const messageMap = messageRef.get(contactId) || new Map()
                    messageMap.set(message.id, message)
                    messageRef.set(contactId, messageMap)
                    setMessages(new Map(messageRef))
                    shiftUpContact(contactId, message)
                    NotifyTone.sent()
            }
            // console.log(messages)
            } catch (error) {
                console.log("Error sending message", error)
            }
        }
    }, [contactId, shiftUpContact])

    useEffect(() => {
        // push new message to message Map
        const msgRecived = (message) => {
            console.log(message)
            console.log(message.id, contactId)
            let { sender } = message
            sender = Number(sender)
            if (!messageRef.has(sender)) {
                getInitialMessages(sender)
            } else {
                incrementUnread(sender, 1)
            }
            console.log(sender)
            const messageMap = messageRef.get(sender) || new Map()
            messageMap.set(message.id, message)
            messageRef.set(sender, messageMap)
            setMessages(new Map(messageRef))
            shiftUpContact(sender, {...message, unread: unreadMsgRef.get(sender)})
            if (selectedContact == sender)
                NotifyTone.sent()
            else
                NotifyTone.recive()
        }

        // delete a single message by msg_id
        const msgDeleted = ({msg_id, sender}) => {
            msg_id = Number(msg_id)
            sender = Number(sender)
            if (!messageRef.has(sender) || !messageRef.get(sender).has(msg_id)) {
                return
            }
            const messageMap = new Map(messageRef.get(sender))
            messageMap.delete(msg_id)
            messageRef.set(messageMap)
            setMessages(new Map(messageMap))
        }

        const seenAll = async (seen_at, reciver) => {
            reciver = Number(reciver)
            if (!messageRef.has(reciver)) return
            setSeenMap(prev => prev.set(reciver, true))
            const messageMap = messageRef.get(reciver)
            messageMap.forEach((msg, key) => {
                if (!msg.seen_at && msg.reciver == reciver) {
                    console.log(seen_at)
                    messageMap.set(key, {...msg, seen_at})
                }
            })
            messageRef.set(reciver, messageMap)
            console.log(messageRef)
            setMessages(new Map(messageRef))
        }

        // seen all messages for a specific contact
        const msgSeen = ({reciver, seen_at}) => {
            seenAll(seen_at, reciver)
        }

        // edit message content by msg_id for a specific contact
        const msgEdited = ({msg_id, newContent, edited_at, sender}) => {
            sender = Number(sender)
            msg_id = Number(msg_id)
            if (!messageRef.has(sender) || !messageRef.get(sender).has(msg_id)) return
            const messageMap = new Map(messageRef.get(sender))
            messageMap.set(msg_id, {...messageMap.get(msg_id), content: newContent, edited_at})
            messageRef.set(sender, messageMap)
            setMessages(new Map(messageRef))
        }

        // update message status based on tick 1|2|3
        const msgStatus = ({msg_id, tick, reciver, recived_at}) => {
            msg_id = Number(msg_id)
            reciver = Number(reciver)
            if (!messageRef.has(reciver) || !messageRef.get(reciver).has(msg_id)) return
            const messageMap = new Map(messageRef.get(reciver))
            messageMap.set(msg_id, {...messageMap.get(msg_id), tick, recived_at})
            messageRef.set(reciver, messageMap)
            setMessages(new Map(messageRef))
        }

        // delete all messages from message Map for given contact
        const msgDeletedAll = ({sender}) => {
            sender = Number(sender)
            if (!messageRef.has(sender)) return
            messageRef.delete(sender)
            setMessages(new Map(messageRef))
        }

        // listen for undeliverd messages
        const waitedMessages = (messages) => {
            messages.forEach(msgRecived)
        }
        // listen for messages
        socket.on('waited:messages', waitedMessages)
        socket.on('message:recive', msgRecived)
        socket.on('message:deleted', msgDeleted)
        socket.on('message:seen', msgSeen)
        socket.on('message:edited', msgEdited)
        socket.on('message:status', msgStatus)
        socket.on('message:deleted:all', msgDeletedAll)
        return () => {
            // removing message events
            socket.off('waited:messages', waitedMessages)
            socket.off('message:recive', msgRecived)
            socket.off('message:deleted', msgDeleted)
            socket.off('message:seen', msgSeen)
            socket.off('message:edited', msgEdited)
            socket.off('message:status', msgStatus)
            socket.off('message:deleted:all', msgDeletedAll)
        }
    }, [contactId])
    return {messages, seenMap, sendMsg, seeMsg}
}
export default useMsgSocket
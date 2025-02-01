import { useCallback, useEffect, useState } from "react"
import socket from '../utils/chatSocket'
import apiRequest from "./apiRequest"
import useContacts from "../context/contacts/contact"

const messageRef = new Map()

const useMsgSocket = (contactId) => {
    const [ messages, setMessages ] = useState(new Map()) // contact_id -> message_id -> message_object
    const [ seenMap, setSeenMap ] = useState(new Map()) // contact_id -> boolean
    const { shiftUpContact } = useContacts()

    // get past conversations
    const getInitialMessages = useCallback(async (id) => {
        id = Number(id)
        if (!id || messageRef.has(id)) return
        const [response, error] = await apiRequest(`/chat/messages/${id}`)
        if (!error) {
            const messageMap = new Map()
            response.forEach(msg => {
                messageMap.set(msg.id, msg)
            })
            messageRef.set(id, messageMap)
            setMessages(messageRef)
        }
    }, [])

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
            }
            console.log(sender)
            const messageMap = messageRef.get(sender) || new Map()
            messageMap.set(message.id, message)
            messageRef.set(sender, messageMap)
            setMessages(new Map(messageRef))
            shiftUpContact(sender, message)
        }

        // delete a single message by msg_id
        const msgDeleted = ({msg_id, sender}) => {
            if (!messageRef.has(sender) || !messageRef.get(sender).has(msg_id)) {
                return
            }
            const messageMap = new Map(messageRef.get(sender))
            messageMap.delete(msg_id)
            messageRef.set(messageMap)
            setMessages(new Map(messageMap))
        }

        const seenAll = async (seen_at, reciver) => {
            setSeenMap(prev => prev.set(reciver, true))
            const messageMap = messageRef.get(reciver)
            messageMap.forEach((msg, key) => {
                if (!msg.seen_at && msg.sender == reciver) {
                    messageMap.set(key, {...msg, seen_at})
                }
            })
            messageRef.set(reciver, messageMap)
            setMessages(new Map(messageRef))
        }

        // seen all messages for a specific contact
        const msgSeen = ({reciver, seen_at}) => {
            seenAll(seen_at, reciver)
        }

        // edit message content by msg_id for a specific contact
        const msgEdited = ({msg_id, newContent, edited_at, sender}) => {
            if (!messageRef.has(sender) || !messageRef.get(sender).has(msg_id)) return
            const messageMap = new Map(messageRef.get(sender))
            messageMap.set(msg_id, {...messageMap.get(msg_id), content: newContent, edited_at})
            messageRef.set(sender, messageMap)
            setMessages(new Map(messageRef))
        }

        // update message status based on tick 1|2|3
        const msgStatus = ({msg_id, tick, reciver, recived_at}) => {
            if (!messageRef.has(reciver) || !messageRef.get(reciver).has(msg_id)) return
            const messageMap = new Map(messageRef.get(reciver))
            messageMap.set(msg_id, {...messageMap.get(msg_id), tick, recived_at})
            messageRef.set(reciver, messageMap)
            setMessages(new Map(messageRef))
        }

        // delete all messages from message Map for given contact
        const msgDeletedAll = ({sender}) => {
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
    return {messages, seenMap, sendMsg}
}
export default useMsgSocket
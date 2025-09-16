import { Children, useCallback, useEffect } from "react"
import socket from "../utils/chatSocket"
import defer from '../utils/defer'

const useRTCPeerSignalingSocket = ({
    onOffer,
    onIceCandidate
}) => {
    
    const sendIceCandidate = useCallback(({
        icecandidate,
        contact_id
    }) => {
        if (!contact_id) throw new Error("'contact_id' is required! --> sendIceCandidate() --> useRTCSignalingSocket.jsx")
        if (icecandidate) {
            socket.emit('call:icecandidate', { icecandidate, contact_id })
        }
    }, [])
    const sendOffer = useCallback(async ({
        offer: offer,
        contact_id
    }) => {
        if (!offer || !contact_id) throw new Error(`'offer' and 'contact_id' both are required! --> sendOffer({offer=${!!offer}, contact_id=${!!contact_id}})`)
        const offerRes = await socket.emitWithAck('call:offer', { offer, contact_id})
        if (offerRes?.success) {
            const { promise, resolveFn, rejectFn } = defer() // call me if you can't figure out what is that function
            socket.once('call:answer', ({answer, contact_id}) => {
                console.log("answer")
                resolveFn({answer, contact_id})
            })
            return {success: true, answer: promise} // it's magic
        } else {
            return {success: false, answer: null}
        }
    }, [])

    const sendAnswer = useCallback(async ({
        answer,
        contact_id
    }) => {
        if (!answer || !contact_id) throw new Error(`'answer' and 'contact_id' both are required! --> sendAnswer({answer=${!!answer}, contact_id=${!!contact_id}})`)
        const answerRes = await socket.emitWithAck('call:answer', {answer, contact_id})
        return { success: answerRes?.success }
    }, [])

    useEffect(() => {
        const receiveOffer = ({
            offer, contact_id
        }) => {
            console.log('new offer recived...')
            onOffer?.({offer, contact_id})
        }
        const receiveIceCandidate = ({
            icecandidate, contact_id
        }) => {
            console.log("Received an Ice Candidate")
            onIceCandidate?.({icecandidate, contact_id})
        }

        socket.on('call:offer', receiveOffer)
        socket.on('call:icecandidate', receiveIceCandidate)
        return () => {
            socket.off('call:offer', receiveOffer)
            socket.off('call:icecandidate', receiveIceCandidate)
        }
    }, [onOffer, onIceCandidate])

    return {
        sendOffer,
        sendAnswer,
        sendIceCandidate,
    }
}
export default useRTCPeerSignalingSocket
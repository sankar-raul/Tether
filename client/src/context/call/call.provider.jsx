import { useCallback, useRef, useState } from "react"
import { CallContext } from "./call.context"
import CallBox from "../../components/CallBox/CallBox"
import PropTypes from 'prop-types'
import useRTCPeerSignalingSocket from "../../hook/useRTCSignalingSocket.hook"

const servers = {
    iceServers: [
      {
        urls: "stun:stun.l.google.com:19302", // STUN server to traverse NAT
      }
    ]
}

export default function CallProvider({children}) {
    const [ isShowCallBox, setShowCallBox ] = useState(false)
    const [ isConnected, setIsConnected ] = useState(false)
    const [ callReciverId, setCallReciverId ] = useState(null)
    const [ contactInfo, setContactInfo ] = useState({})
    const peerConnection = useRef(null)
    const localVideoStream = useRef(null)
    const remoteVideoStream = useRef(null)
    const pendingCandidates = useRef([])
    const [ remoteStream, setRemoteStream ] = useState(null)
    const [ localStream, setLocalStream ] = useState(null)

    const { sendAnswer, sendOffer, sendIceCandidate, endCall } = useRTCPeerSignalingSocket({
        onOffer: (args) => handleOffer(args),
        onIceCandidate: (args) => handleIceCandidate(args),
        onCallEnd: () => handleCallEnd(true, true)
    })

    const handleOffer = async ({offer, contact_id}) => {
        setCallReciverId(contact_id)
        setShowCallBox(true)
        console.log("offer recived")
        await createPeerConnection({contact_id})
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer))
        setUpPeerConnection({contact_id})
        setUpIceCandidate({contact_id})
        const answer = await peerConnection.current.createAnswer()
        await peerConnection.current.setLocalDescription(answer)
        const { success } = await sendAnswer({answer: answer, contact_id})
        if (success) {
            console.log("offer recived and answer send")
        }
    }

    const handleIceCandidate = useCallback(({icecandidate, contact_id}) => {
        // console.log(peerConnection.current)
        if (peerConnection.current) {
            peerConnection.current.addIceCandidate(new RTCIceCandidate(icecandidate))
        } else {
            pendingCandidates.current.push(icecandidate)
        }
    }, [])
    const handleAnswer = useCallback(({answer, contact_id}) => {
        // console.log("answer received")
        peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer))
    }, [])

      const startTethering = useCallback(async ({
        audio = true,
        video= true
    } = {}) => {
        if (localVideoStream.current) {
            // console.log("recall")
            return
        }
        try {
            localVideoStream.current = await navigator.mediaDevices.getUserMedia({
              audio: audio ? { echoCancellation: true } : false,
              video: video ? { facingMode: "user" } : false
            })
            setLocalStream(localVideoStream.current)
        } catch (error) {
            console.error("CallBox.jsx --> error at startTethering()", error)
        }
        
    }, [localVideoStream])

    const setUpIceCandidate = useCallback(({contact_id}) => {
           peerConnection.current.onicecandidate = e => {
            if (e.candidate) {
                sendIceCandidate({contact_id: contact_id, icecandidate: e.candidate, peer: peerConnection.current})
            }
        }
    }, [sendIceCandidate])

    const setUpPeerConnection = useCallback(({contact_id}) => {
        if (!remoteVideoStream.current) {
            remoteVideoStream.current = new MediaStream()
        }
        peerConnection.current.ontrack = e => {
            // console.log(e.track)
            remoteVideoStream.current.addTrack(e.track)
        }
            setRemoteStream(remoteVideoStream.current)

        localVideoStream.current.getTracks().forEach(track => {
            peerConnection.current.addTrack(track)
        })
        //    peerConnection.current.onicecandidate = e => {
        //     if (e.candidate) {
        //         sendIceCandidate({contact_id: contact_id, icecandidate: e.candidate, peer: peerConnection.current})
        //     }
        // }
         pendingCandidates.current.forEach(c => { // flush pending ice candidates
            peerConnection.current.addIceCandidate(new RTCIceCandidate(c))
        })
        pendingCandidates.current = []
    }, [])

    const createPeerConnection = useCallback(async ({contact_id}={}) => {
        await startTethering()
        if (peerConnection.current) return
        peerConnection.current = new RTCPeerConnection(servers) // let's start the peer connection
        
       
    }, [startTethering])

     const stopCapturing = useCallback(() => { // end call
        if (!localVideoStream.current) return
        localVideoStream.current?.getTracks().forEach(track => track.stop())
        localVideoStream.current = null
    }, [localVideoStream])

    const handleCallEnd = useCallback((isCallEnded, isCallEndedByContact = false) => {
        setShowCallBox(!isCallEnded)
        isCallEndedByContact || endCall({contact_id: callReciverId})
        stopCapturing()
        peerConnection.current?.close()
        peerConnection.current = null
        // localVideoStream.current = null
        remoteVideoStream.current = null
    }, [endCall, callReciverId, stopCapturing])

    var callEndedByContact = useCallback(() => {
        console.log("call ended by c")
        handleCallEnd(true, true) // isCallended, isCallByContact
    }, [handleCallEnd])

    const startCall = useCallback(async ({
        contact_id,
        contact_info,
        type = 'video', // audio | video
    }) => {
        if (!contact_id) {
            console.error("contact_id can't be undefined!:-> startCall()")
            return
        }
        setCallReciverId(contact_id)
        setContactInfo(prev => ({...prev, ...contact_info, id: contact_id}))
        setShowCallBox(true)
        await createPeerConnection({contact_id})
        setUpPeerConnection({contact_id})
        const offer = await peerConnection.current.createOffer()
        setUpIceCandidate({contact_id})
        await peerConnection.current.setLocalDescription(offer)
        const {success, answer} = await sendOffer({contact_id, offer})
        if (success) {
            answer.then(args => handleAnswer(args))
        } else {
            console.error("Somthing went wrong. -> sendOffer() -> call.provider.jsx")
            alert("some thing went wrong please check the console...")
        }
    }, [sendOffer, createPeerConnection, handleAnswer, setUpPeerConnection, setUpIceCandidate])
    return (
        <CallContext.Provider value={{startCall, remoteVideoStream, localVideoStream, localStream, remoteStream}}>
            {children}
            {isShowCallBox ? <CallBox contactInfo={contactInfo} setIsCallEnded={handleCallEnd} /> : <></>}
        </CallContext.Provider>
    )
}
CallProvider.propTypes = {
    children: PropTypes.node.isRequired,
}
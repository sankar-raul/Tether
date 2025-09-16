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
    const [ remoteStream, setRemoteStream ] = useState(null)
    const [ localStream, setLocalStream ] = useState(null)

    const { sendAnswer, sendOffer, sendIceCandidate } = useRTCPeerSignalingSocket({
        onOffer: handleOffer,
        onIceCandidate: handleIceCandidate
    })

    async function handleOffer({offer, contact_id}) {
        setCallReciverId(contact_id)
        setShowCallBox(true)
        console.log("offer recived")
        await createPeerConnection({contact_id})
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer))
        const answer = await peerConnection.current.createAnswer()
        await peerConnection.current.setLocalDescription(answer)
        const { success } = await sendAnswer({answer: peerConnection.current.localDescription, contact_id})
        if (success) {
            console.log("offer recived and answer send")
        }
    }
    

    var handleIceCandidate = ({icecandidate, contact_id}) => {
        console.log(peerConnection.current)
        peerConnection.current.addIceCandidate(new RTCIceCandidate(icecandidate))
    }
    const handleAnswer = useCallback(({answer, contact_id}) => {
        console.log("answer received")
        peerConnection.current.setRemoteDescription(answer)
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

    const createPeerConnection = useCallback(async ({contact_id}={}) => {
        await startTethering()
        if (peerConnection.current) return
        peerConnection.current = new RTCPeerConnection(servers) // let's start the peer connection
        
        if (!remoteVideoStream.current) {
            remoteVideoStream.current = new MediaStream()
        }
        peerConnection.current.ontrack = e => {
            // console.log(e)
            remoteVideoStream.current.addTrack(e.track)
        }
            setRemoteStream(remoteVideoStream.current)

        peerConnection.current.onicecandidate = e => {
            if (e.candidate) {
                sendIceCandidate({contact_id: contact_id, icecandidate: e.candidate, peer: peerConnection.current})
            }
        }
        localVideoStream.current.getTracks().forEach(track => {
        peerConnection.current.addTrack(track)
        // console.log(track)
        })
        console.log("ok")
    }, [sendIceCandidate, startTethering])

    const handleCallEnd = useCallback((isCallEnded) => {
        setShowCallBox(!isCallEnded)
        peerConnection.current.close()
        peerConnection.current = null
        // localVideoStream.current = null
        remoteVideoStream.current = null
    }, [])
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
        const offer = await peerConnection.current.createOffer()
        await peerConnection.current.setLocalDescription(offer)
        const {success, answer} = await sendOffer({contact_id, offer})
        if (success) {
            answer.then(args => handleAnswer(args))
        } else {
            console.error("Somthing went wrong. -> sendOffer() -> call.provider.jsx")
            alert("some thing went wrong please check the console...")
        }
    }, [sendOffer, createPeerConnection, handleAnswer])
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
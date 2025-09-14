import { Call } from '../Call/Call'
import styles from './callbox.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMinus, faRotate, faUpRightAndDownLeftFromCenter, faXmark } from '@fortawesome/free-solid-svg-icons'
import { faSquare } from '@fortawesome/free-regular-svg-icons'
import callEndIcon from '../../assets/svg/call/call-end.svg'
import muteIcon from '../../assets/svg/call/mute.svg'
import videoOffIcon from '../../assets/svg/call/video-off.svg'
import threeDotXIcon from '../../assets/svg/call/three-dot-x.svg'

import { useCallback, useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { icon } from '@fortawesome/fontawesome-svg-core'
import CallControllButton from './CallControllButton/CallControllButton'
import { DefaultUser } from '../DefaultUser/DefaultUser'

const CallBox = ({mute = false, video = true, type = 'call', setIsCallEnded, contactInfo = {}}) => {
    const [ axis, setAxis ] = useState({left: 'auto', top: '10%', bottom: 'auto', right: '10%'}) // default state or picked from localStorage
    const myVideoRef = useRef(null)
    const remoteVideoRef = useRef(null)
    const localVideoStream = useRef(null)
    const remoteVideoStream = useRef(null)
    const [ isMuted, setIsMuted ] = useState(mute)
    const [ isVideo, setIsVideo ] = useState(video)
    const [ callStatus, setCallStatus ] = useState("Calling...")
    const [ callTimeStamp, setCallTimeStamp ] = useState('00.00') 
    const [ isFrontCam, setIsFrontCam ] = useState(true)
    
    const stopCam = useCallback(() => { // stop video streaming
        if (!localVideoStream.current) return
        localVideoStream.current?.getVideoTracks().forEach(track => track.stop())
    }, [])

    const stopAudio = useCallback(() => { // mute audio
        if (!localVideoStream.current) return
        localVideoStream.current?.getAudioTracks().forEach(track => track.stop())
    }, [])

    const restartCam = useCallback(async () => { // turn on video streaming
        if (!localVideoStream.current) return
        const videoStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" },
        })
        const videoTrack = videoStream.getVideoTracks()[0]
        localVideoStream.current.removeTrack(localVideoStream.current.getVideoTracks()[0])
        localVideoStream.current.addTrack(videoTrack)
        // myVideoRef.current.srcObject = null
        // myVideoRef.current.srcObject = localVideoStream.current
    }, [])

    const restartAudio = useCallback(async () => { // unmute audio
        if (!localVideoStream.current) return
        const videoStream = await navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: true },
        })
        const audioTrack = videoStream.getAudioTracks()[0]
        localVideoStream.current.removeTrack(localVideoStream.current.getAudioTracks()[0])
        localVideoStream.current.addTrack(audioTrack)
    }, [])

    const stopCapturing = useCallback(() => { // end call
        if (!localVideoStream.current) return
        localVideoStream.current?.getTracks().forEach(track => track.stop())
    }, [])

    const startTethering = useCallback(async ({
        audio = true,
        video= true
    }) => {
        if (localVideoStream.current) {
            // console.log("recall")
            return
        }
        try {
            localVideoStream.current = await navigator.mediaDevices.getUserMedia({
              audio: audio ? { echoCancellation: true } : false,
              video: video ? { facingMode: "user" } : false
            })
            myVideoRef.current.srcObject = localVideoStream.current
        } catch (error) {
            console.error("CallBox.jsx --> error at startTethering()", error)
        }
        
    }, [])

    const handleVideoStream = useCallback(() => {
        setIsVideo(prev => {
            if (prev) {
                stopCam()
            } else {
                restartCam()
            }
            return !prev
        })
    }, [stopCam, restartCam])
    
    const handleAudioStream = useCallback(() => {
        setIsMuted(prev => {
            if (prev) {
                restartAudio()
            } else {
                stopAudio()
            }
            return !prev
        })
    }, [stopAudio, restartAudio])

    const endCall = useCallback(() => {
        setIsCallEnded(true)
        stopCapturing()
    }, [stopCapturing, setIsCallEnded])

    // useEffect(() => {
    //     if (!localVideoStream.current) return
    //     isMuted ? stopAudio() : restartAudio()
    // }, [isMuted, stopAudio, restartAudio])

    // useEffect(() => {
    //     if (!localVideoStream.current) return
    //     isVideo ? restartCam() : stopCam()
    // }, [isVideo, restartCam, stopCam])
    useEffect(() => {
        // console.log(navigator.mediaDevices.getSupportedConstraints())
        (async () => {
            await startTethering({
                audio: !mute,
                video: video
            })
            myVideoRef.current.srcObject = localVideoStream.current
        })()
    }, [isFrontCam, startTethering, video, mute])
    return (
        <div className={styles['call-box-parent-container']}>
            <section className={styles['call-box']}>
                <div className={styles['call-contact-details-container']}>
                    <div className={styles['call-contact-details']}>
                        <div className={styles['contact-details']}>
                            <div className={styles['contact-profile-pic']}>
                                <img src="https://www.shutterstock.com/image-photo/closeup-portrait-fluffy-purebred-cat-260nw-2447243735.jpg" alt="" />
                            </div>
                            <div className={styles['contact-data']}>
                                <p className={styles['contact-name']}>{contactInfo.username}</p>
                                <p className={styles['call-time']}>02.21</p>
                            </div>
                        </div>
                        <div>
                            <CallControllButton fontawesomeIcon={faRotate} label={"Switch camera"} alt={'Switch camera'}/>
                        </div>
                    </div>
                    <div className={styles['contact-controller']}>
                        <CallControllButton fontawesomeIcon={faUpRightAndDownLeftFromCenter} label={"Full screen"} alt={'Full screen'}/>
                    </div>
                </div>
                <div className={styles['my-video-preview-container']}>
                    <div className={styles['my-video-parent']}>
                        <div data-video={isVideo ? 'on' : 'off'} className={styles['my-video']}>
                            <video ref={myVideoRef} src="/demo_nosound.mp4" loop muted autoPlay></video>
                            { !isVideo ? <div className={styles['video-off-banner']}>
                                <div className={styles['user-dp']}>
                                    {
                                        contactInfo.profile_pic_url ? <img className={styles['dp-image']} onLoad={(e) => e.target.style.display = 'block'} src={contactInfo.profile_pic_url} alt={contactInfo.username} /> : <DefaultUser />
                                    }
                                </div>
                            </div> : <></> }
                        </div>
                    </div>
                </div>
                <div className={styles['call-controller-container']}>
                    <div className={styles['call-controller']}>
                        <CallControllButton icon={threeDotXIcon} label={"More options"} alt={'More Options'}/>
                        <CallControllButton onClick={handleAudioStream} icon={muteIcon} active={isMuted} label={"Mute"} alt={'Mute'}/>
                        <CallControllButton onClick={handleVideoStream} icon={videoOffIcon} active={!isVideo} label={"Turn of video"} alt={'Off Video'}/>
                        <CallControllButton onClick={endCall} icon={callEndIcon} label={"End call"} alt={'End Call'} type='danger'/>
                    </div>
                </div> 
            </section>
            <div className={styles['main-video-container']}>
                <video ref={remoteVideoRef} className={styles['main-video']} src="/demo_nosound.mp4" muted autoPlay={false} loop>
                    Video play back is not supported by your Browser
                </video>
            </div>
        </div>
    )
}
CallBox.propTypes = {
    mute: PropTypes.bool,
    video: PropTypes.bool,
    type: PropTypes.string,
    setIsCallEnded: PropTypes.func.isRequired
}
export default CallBox
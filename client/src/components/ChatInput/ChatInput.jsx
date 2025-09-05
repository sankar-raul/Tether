import { useCallback, useEffect, useRef, useState } from 'react'
import styles from './chatInput.module.css'
import PropTypes from 'prop-types'
import useChat from '../../context/chatSocket/chatSocket'
import sentIcon from '../../assets/svg/chat/send.svg'
import attachIcon from '../../assets/svg/chat/attach.svg'
import useContacts from '../../context/contacts/contact'
import { useMediaQuery } from 'react-responsive'

const ChatInput = ({scrollRef}) => {
    const { sendMsg, handleTyping } = useChat()
    const inputRef = useRef(null)
    const isMobile = useMediaQuery({ query: '(max-width: 700px)' })
    const { selectedContact } = useContacts()
    const [ text, setText ] = useState('')
    const handleInput = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault()
          send(e)
        } else {
          setText(String(e.target.innerText))
        }
    }
    const focusInput = useCallback(() => {
      inputRef && inputRef.current.focus()
    }, [])
    
    const send = useCallback((e) => {
        e.preventDefault()
        focusInput()
        const messageContent = text.trim()
        if (messageContent.length > 0) {
            scrollRef?.current.scrollIntoView()
            setText('')
            inputRef.current.innerText = ''
            sendMsg(messageContent)
            setTimeout(() => scrollRef?.current.scrollIntoView(), 1000) // its personal
        }
    }, [sendMsg, scrollRef, text, focusInput])

    useEffect(() => {
      isMobile || selectedContact && focusInput()
    }, [selectedContact, focusInput, isMobile])
    return (
        <div className={styles['msg-send-bar']}>
          <form onSubmit={send} className={styles['msg-send-bar-wraper']}>
            <div className={styles["non-text-chat-items"]}>
              <img src={attachIcon} alt="media" />
            </div>
            <div className={styles["chat-input"]}>
              {/* <input className={styles['input']} ref={inputRef} onChange={handleInput} type="text" placeholder='Type and Tether...' value={text} autoComplete='off' onInput={handleTyping} /> */}
              <div aria-label='chatInput' className={styles['input']} type="text" placeholder='Type and Tether...' value={text} autoComplete='off'autoCorrect='off' onInput={handleTyping} >
                <p className={styles['chat-input-p']} onKeyUp={handleInput} ref={inputRef} contentEditable='true' role='textbox'></p>
              </div>
            </div>
            <div className={styles['message-send-btn']}>
              <button type='submit'>
                <img src={sentIcon} alt="send" />
              </button>
            </div>
          </form>
        </div>
    )
}
ChatInput.propTypes = {
  scrollRef: PropTypes.object
}
export default ChatInput
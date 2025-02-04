import { useEffect, useRef, useState } from 'react'
import styles from './chatInput.module.css'
import PropTypes from 'prop-types'
import useChat from '../../context/chatSocket/chatSocket'
import sentIcon from '../../assets/svg/chat/send.svg'
import attachIcon from '../../assets/svg/chat/attach.svg'
import useContacts from '../../context/contacts/contact'

const ChatInput = ({scrollRef}) => {
    const { sendMsg } = useChat()
    const inputRef = useRef(null)
    const { selectedContact } = useContacts()
    const [ text, setText ] = useState('')
    const handleInput = (e) => {
        setText(e.target.value)
    }
    const send = (e) => {
        e.preventDefault()
        const messageContent = text.trim()
        if (messageContent.length > 0) {
          scrollRef?.current.scrollIntoView()
            setText('')
            sendMsg(messageContent)
        }
    }
    useEffect(() => {
      inputRef && inputRef.current.focus()
    }, [selectedContact])
    return (
        <div className={styles['msg-send-bar']}>
          <form onSubmit={send} className={styles['msg-send-bar-wraper']}>
            <div className={styles["non-text-chat-items"]}>
              <img src={attachIcon} alt="media" />
            </div>
            <div className={styles["chat-input"]}>
              <input className={styles['input']} ref={inputRef} autoFocus onChange={handleInput} type="text" placeholder='Type and Tether...' value={text} />
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
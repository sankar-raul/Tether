import { useOutletContext } from 'react-router-dom';
import styles from './default-view.module.css'
import { useEffect } from 'react';

const DefaultChatView = () => {
    // const { setIsHideRightContainer } = useOutletContext();

    // useEffect(() => {
    //     setIsHideRightContainer(true)
    // }, [setIsHideRightContainer])
    return (
        <section className={styles['container']}>
            <div>
                <p>Please select a contact to continue</p>
            </div>
        </section>
    )
}
export default DefaultChatView
import styles from './loader.module.css'


export const Loader = () => {

    return (
        <div className={styles['loading-animation']}>
            <div style={{'--delay': '.1s'}}></div>
            <div style={{'--delay': '.2s'}}></div>
            <div style={{'--delay': '.3s'}}></div>
            <div style={{'--delay': '.4s'}}></div>
        </div>
    )
}
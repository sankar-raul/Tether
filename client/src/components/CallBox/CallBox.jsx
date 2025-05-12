import { Call } from '../Call/Call'
import styles from './callbox.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMinus, faXmark } from '@fortawesome/free-solid-svg-icons'
import { faSquare } from '@fortawesome/free-regular-svg-icons'
import { useCallback, useState } from 'react'

const CallBox = () => {
    const [ axis, setAxis ] = useState({left: 'auto', top: '10%', bottom: 'auto', right: '10%'}) // default state or picked from localStorage
    const handleLRResize = useCallback((e) => {
        setAxis(prev => ({...prev, top: '60%'}))
        // console.log('draging')
    }, [])
    return (
        <div>
            Call
        </div>
        // <section className={styles['call-box']} style={{...axis}}>
        //     <div className={styles['call-box-controll-bar']}>
        //         <div>Tether</div>
        //         <div className={styles['controll-btns']}>
        //             <div title='po'>
        //                 <FontAwesomeIcon icon={faMinus} className={styles['controll-icons']} />
        //             </div>
        //             <div>
        //                 <FontAwesomeIcon title='minimize' icon={faSquare} className={styles['controll-icons']}/>
        //             </div>
        //             <div>
        //                 <FontAwesomeIcon title='end call' icon={faXmark} className={styles['controll-icons']}/>
        //             </div>
        //         </div>
        //     </div>
        //     <div className={styles['call-container']}>
        //         <Call type={'audio'} to={1} />
        //     </div>
        //     {/* here the resizing pillers works */}
        //     <div className={styles['right-resize'] + ' ' + styles['resizer']} onMouseDown={handleLRResize} ></div>
        //     <div className={styles['left-resize'] + ' ' + styles['resizer']} onDrag={handleLRResize}></div>
        //     <div className={styles['top-resize'] + ' ' + styles['resizer']}></div>
        //     <div className={styles['bottom-resize'] + ' ' + styles['resizer']}></div>
        //     {/* resizing pillers end */}
        // </section>
    )
}
export default CallBox
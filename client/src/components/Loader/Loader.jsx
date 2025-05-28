import { ShowUser } from '../ChatComponents/SearchWindow/SearchWindow'
import styles from './loader.module.css'
import PropTypes, { func } from 'prop-types'

const LoaderOptions = {
    skeleton: SkeletonUser,
    dotLoader: DotLoader,
    msgLoaderSkeleton: MsgLoaderSkeleton
}

export const Loader = ({type, ...props}) => {
    // console.log(type)
    const SelectedLoader = LoaderOptions[type] || (() => {})
    return <SelectedLoader {...props} />
}
Loader.propTypes = {
    type: PropTypes.string,
}

function SkeletonUser({count=1, ...props}) {

    return (
        <>
            {Array(count).fill(0).map((_, idx) => <ShowUser key={idx} skeleton={true} animationDelay={'0s'} {...props} />)}
        </>
    )
}
SkeletonUser.propTypes = {
    count: PropTypes.number
}
function DotLoader({dotWidth, color, align, speed, ...props}) {

    return (
        <div className={styles['loading-animation']} style={{'--dot-width': dotWidth || '8px', '--dot-color': color || 'var(--brand-color)', '--align': align || 'center', '--speed': speed || '.8s'}} {...props}>
            <div style={{'--delay': '.1s'}}></div>
            <div style={{'--delay': '.2s'}}></div>
            <div style={{'--delay': '.3s'}}></div>
            <div style={{'--delay': '.4s'}}></div>
        </div>
    )
}
DotLoader.propTypes = {
    dotWidth: PropTypes.string,
    color: PropTypes.string,
    align: PropTypes.string,
    speed: PropTypes.string,
    count: PropTypes.number
}

const SingleMsgSkeleton = () => {

    return (
        <div className={styles['single-msg-skeleton']}></div>
    )
}

function MsgLoaderSkeleton({count=6}) {

    return (
        <section className={styles['msgLoaderSkeleton']}>
            {Array(count).fill(0).map((_, idx) => {
                return <SingleMsgSkeleton key={idx}/>
            })}
        </section>
    )
}
MsgLoaderSkeleton.propTypes = {
    count: PropTypes.number
}
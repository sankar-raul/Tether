import PropTypes from 'prop-types'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { resizeableContext } from './resizeableAside'
import { setItem, getItem } from '../../utils/localStorage'

const ResizeableAsideProvider = ({ children }) => {
    
    const [ isResizing, setIsResizing ] = useState(false)
    const minmax = useMemo(() => ({min: 300, max: window.innerWidth / 2 - 50}), [])
    const resizeableDiv = useRef(null)
    const [ newWidth, setNewWidth ] = useState(getItem('contact-width') || `clamp(${minmax.min}px, 20vw, minmax(450px, ${minmax.max}px))`)
    const handleMouseUp = useCallback(() => {
        setIsResizing(false)
        // console.log("up")
    }, [])
    const handleMouseDown = useCallback(() => {
        setIsResizing(true)
        // console.log("down")
        document.addEventListener('mouseup', handleMouseUp)
        return () => {
            document.removeEventListener('mouseup', handleMouseUp)
        }
    }, [handleMouseUp])

    const calculateNewWidth = useCallback((clientX) => {
        setNewWidth((prev) => {
            const nW = clientX - resizeableDiv.current.getBoundingClientRect().left
            const { min, max } = minmax
            if (nW > min && nW < max) {
                return nW + 'px'
            } else {
                return prev
            }
        })
    }, [minmax])

    const handleDrag = useCallback((e) => {
        // document.body.addEventListener('mousemove', handleDrag)
        if (!isResizing) return
            calculateNewWidth(e.clientX)
    }, [ isResizing, calculateNewWidth ])

    useEffect(() => {
        if (newWidth) {
            resizeableDiv.current.style.width = newWidth
            setItem('contact-width', newWidth)
        }
    }, [newWidth])

    useEffect(() => {
        if (isResizing) {
            document.body.style.cursor = 'ew-resize'  
        } else {
            document.body.style.cursor = ''
        }
    }, [isResizing])
    useEffect(() => {
        document.body.addEventListener('mousemove', handleDrag)
        return () => {
            document.body.removeEventListener('mousemove', handleDrag)
        }
    }, [handleDrag])

    useEffect(() => {
        const callback = e => {
            console.log(e.target.innerWidth)
            minmax.max = e.target.innerWidth / 2 - 50
            // setNewWidth(`clamp(${minmax.min}, 20vw, ${minmax.max}px)`)
        }
        window.addEventListener('resize', callback)
        return () => window.removeEventListener('resize', callback)
    }, [])

    return (
        <resizeableContext.Provider value={{handleMouseDown, resizeableDiv}}>
            {children}
        </resizeableContext.Provider>
    )
}
ResizeableAsideProvider.propTypes = {
    children: PropTypes.node
}

export default ResizeableAsideProvider
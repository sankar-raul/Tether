import PropTypes from 'prop-types'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { resizeableContext } from './resizeableAside'
import { setItem, getItem } from '../../utils/localStorage'

const ResizeableAsideProvider = ({ children }) => {
    
    const [ isResizing, setIsResizing ] = useState(false)
    const minmax = useMemo(() => ({min: 200, max: 500}), [])
    const resizeableDiv = useRef(null)
    const [ newWidth, setNewWidth ] = useState(getItem('contact-width') || null)
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
        document.body.addEventListener('mousemove', handleDrag)
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
import { useState, useEffect, useRef } from "react"

const useIntersectionObserver = ({ threshold = 0.1, root = null, rootMargin = "0px" }) => {
    const [isIntersecting, setIsIntersecting] = useState(false)
    const elementRef = useRef(null)

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            setIsIntersecting(entry.isIntersecting)
            // console.log(entry)
        }, { threshold, root, rootMargin })

        const elementCurrent = elementRef.current
        if (elementRef.current) {
            observer.observe(elementCurrent)
        }

        return () => {
            if (elementCurrent) {
                observer.unobserve(elementCurrent)
            }
        };
    }, [threshold, root, rootMargin, elementRef])
    useEffect(() => {
        // console.log(elementRef, 'hero')
    }, [elementRef])

    return [elementRef, isIntersecting]
};

export default useIntersectionObserver

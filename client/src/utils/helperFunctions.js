export function debounce(func, delay = 500) {
    let timer
    // console.log("started")
    return (...args) => {
        clearTimeout(timer)
        timer = setTimeout(() => func(...args), delay)
    }
}

export function throttle(func, delay = 500) {
    let canCall = true
    return (...args) => {
        if (canCall) {
            func(...args)
            canCall = false
            setTimeout(() => (canCall = true), delay)
        }
    }
}
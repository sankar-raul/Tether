export const setItem = (key, value) => {
    if (key) {
        localStorage.setItem(key, value)
    }
}

export const getItem = (key) => {
    if (key) {
        return localStorage.getItem(key)
    }
}

export const clearItems = () => {
    localStorage.clear()
}

export const removeItem = (key) => {
    if (key) {
        localStorage.removeItem(key)
    }
}
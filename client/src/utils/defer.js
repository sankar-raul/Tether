export default function defer() {
    let resolveFn, rejectFn
    const promise = new Promise((resolve, reject) => {
        resolveFn = resolve
        rejectFn = reject
    })
    return {
        resolveFn, rejectFn, promise
    }
}
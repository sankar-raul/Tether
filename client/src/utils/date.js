export class HeroDate extends Date {
    constructor(str) {
        if (str) {
            super(str)
        } else {
            super()
        }
    }
    formatedDate() {
        const [ dd, mm, yy ] = [
            String(this.getDate()).padStart(2, '0'),
            String(this.getMonth() + 1).padStart(2, '0'),
            String(this.getFullYear()).slice(2)
        ]
        return `${dd}-${mm}-${yy}`
    }
    formatedTime() {
        const [ hh, mm, ff ] = [
            this.toLocaleTimeString().split(':')[0].padStart(2, '0'),
            String(this.getMinutes()).padStart(2, '0'),
            this.toLocaleTimeString().split(' ')[1]
        ]
        return `${hh}:${mm} ${ff}`
    }
}
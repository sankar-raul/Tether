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
        const [ hh, mm, ff ] = this._12()
        return `${hh}:${mm} ${ff}`
    }
    _12() {
        const hours = this.getHours()
        let hh, ff
        if (hours <= 12) {
            hh = hours
            ff = hours == 12 ? 'PM' : 'AM'
        } else {
            hh = hours - 12
            ff = 'PM'
        }
        return [ String(hh).padStart(2, '0'), String(this.getMinutes()).padStart(2, '0'), ff ]
    }
}
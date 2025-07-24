import { createHash, randomInt } from "crypto"


class Otp {
    #hashOtp(otp) {
        if (!otp) return
        return createHash('sha256').update(otp).digest('hex') // 🔒
    }
    generateOtp(length=6) {
        let otp = ''
        while (length--) {
            otp += String.fromCharCode(randomInt(65, 90))
        }
        return [this.#hashOtp(otp), otp]
    }
    verify(otp, hashedOtp) {
        return this.#hashOtp(otp) == hashedOtp
    }
}
const OTP = new Otp()
export default OTP
export const userRoot = (req, res) => {
    if (req.user) {
        return res.status(200).json({success: true, user: req.user, msg: "success"})
    } else {
        return res.status(401).json({success: false, msg: "access denied!"})
    }
}
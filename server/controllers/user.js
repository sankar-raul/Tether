import pool from "../db/pool.js"

export const userRoot = (req, res) => {
    if (req.user) {
        return res.status(200).json({success: true, user: req.user, msg: "success"})
    } else {
        return res.status(401).json({success: false, msg: "access denied!"})
    }
}

export const search = async (req, res) => {
    let { q, part } = req.query
    const results_per_part = 10
    let offset = 0
    console.log(part)
    if (part) {
        part = Number(part)
        offset = (part - 1) * results_per_part
    }
    q = q?.trim()
    if (!q || !req.user || typeof q !== 'string' || q.length > 50) {
        return res.status(400).json({success: false, msg: "bad request!"})
    }
    try {
        const searchRes = await pool.execute(`select id, username, profile_pic_url, bio from users where username like ? limit ${results_per_part + 1} offset ${offset}`, [`%${q}%`])
        const result = searchRes[0]
        const totalResults = result?.length
        if (totalResults == results_per_part + 1) {
            result.pop()
        }
        const response = {
            data: totalResults == 0 ? null : result,
            part: part || 1,
            next: totalResults == results_per_part + 1 ? `/user/search?q=${q}&part=${part ? part + 1 : 2}` : null,
            query: q
        }
        return res.status(200).json(response)
    } catch (error) {
        console.log(error)
    }
    res.end()
}
import pool from "../db/pool.js"
import { searchUser } from "../service/meilsearch/search.js"

export const userRoot = async (req, res) => {
    if (req.user) {
        const [data, _] = await pool.execute('select profile_pic_url, username, email, bio from users where id = ?', [req.user?.id])
        req.user = {...req.user, ...data[0]}
        return res.status(200).json({success: true, user: req.user, msg: "success"})
    } else {
        return res.status(401).json({success: false, msg: "access denied!"})
    }
}

export const search = async (req, res) => {
    let { q, part } = req.query
    const results_per_part = 10 //pagination of in length 10 chunks
    let offset = 0
    // console.log(part)
    part = part ? Number(part) : 1
    q = q?.trim()
    if (!q || !req.user || typeof q !== 'string' || q.length > 50) {
        return res.status(400).json({success: false, msg: "bad request!"})
    }
    try {
        // const searchRes = await pool.execute(`select id, username, profile_pic_url, bio from users where username like ? order by username limit ${results_per_part + 1} offset ${offset}`, [`%${q}%`])
        const searchRes = await searchUser(q, {
            page: part,
            limit: results_per_part
        })
        const result = searchRes
        const totalResults = result?.length
        const response = {
            data: result,
            length: totalResults,
            part: part,
            next: totalResults == results_per_part ? `/user/search?q=${q}&part=${part + 1}` : null,
            query: q
        }
        return res.status(200).json(response)
    } catch (error) {
        console.log(error)
    }
    res.end()
}
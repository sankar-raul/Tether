import meili from "./meili.js"

export async function searchUser(query, {page, limit}) {
    if (!query) return []
    const results = await meili.index('users').search(query, {
        page: page || 1,
        hitsPerPage: limit || 15
    })
    return results?.hits || []
}

const data = {
    searchUser,
}

export default data
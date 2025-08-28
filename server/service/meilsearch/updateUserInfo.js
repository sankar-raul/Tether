import meili from "./meili.js"

export default async function updateUserInfo(id, data) {
    if (!id || !data) return
    const index = meili.index('users')
    await index.addDocuments([{id, ...data}])
}
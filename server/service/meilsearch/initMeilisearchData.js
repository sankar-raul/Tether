import meili from "./meili.js"
import { poolCB } from "../../db/pool.js"

export default async function initMeili() {
    try {
        console.log("Initiating meilisearch...")
        const index = meili.index("users")
        await index.deleteAllDocuments()
        // setting up searchable fields
        await index.updateSearchableAttributes(['username', 'fullname'])
        const BATCH_SIZE = 2
        let batch = []
        const stream = poolCB.query("select id, username, fullname, email, profile_pic_url from users").stream()
        stream.on('data', async (row) => {
            batch.push(row)
            if (batch.length >= BATCH_SIZE) {
                stream.pause()
                const task = await index.addDocuments(batch)
                batch = []
                // console.log(task)
                stream.resume()
            }
        })
        stream.on('end', async () => {
            if (batch.length > 0) {
                const task = await index.addDocuments(batch)
                // console.log(task)
            }
            console.log("Meilsearch initiated")
        })
    } catch (error) {
        console.log(error)
    }
}
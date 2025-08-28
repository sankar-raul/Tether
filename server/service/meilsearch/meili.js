import { MeiliSearch } from "meilisearch"
import { config } from "dotenv"
config({path: '../../.env'})

const MASTER_KEY = process.env.MEILISEARCH_MASTER_KEY
const MEILISEARCH_HOST = process.env.MEILISEARCH_HOST
// console.log(MASTER_KEY)

const meili = new MeiliSearch({
    apiKey: MASTER_KEY,
    host: MEILISEARCH_HOST
})

export default meili
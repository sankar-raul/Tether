import { createConnection } from 'mysql2/promise'

let connection = createConnection({
    host: "localhost",
    user: "sankar",
    password: "@Sankar1@",
    port: 3306,
    database: "bro_chat"
})
export default connection
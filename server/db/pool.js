import { createPool } from 'mysql2/promise'
import { config } from 'dotenv'
config()
let pool = createPool({
    host: process.env.HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: process.env.DB,
    connectionLimit: 10,
    queueLimit: 0
})
export default pool
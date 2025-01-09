import { createPool } from 'mysql2/promise'
import { config } from 'dotenv'
config()
let pool = createPool({
    host: process.env.HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT) || 3306,
    database: process.env.DB,
    connectionLimit: 10,
    queueLimit: 0
})
export default pool
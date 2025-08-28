import { createPool } from 'mysql2/promise'; // promise pool
import { createPool as createPoolCB } from 'mysql2'; // callback pool
import { config } from 'dotenv';

// Load environment variables
config();

// Create a MySQL connection 
const dbConfig = {
    host: process.env.HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DBPORT) || 3306,
    database: process.env.DB,
}

const pool = createPool(dbConfig);
export const poolCB = createPoolCB(dbConfig)

export default pool;

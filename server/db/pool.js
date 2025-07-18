import { createPool } from 'mysql2/promise';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
config();

// Create a MySQL connection pool
const pool = createPool({
    host: process.env.HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DBPORT) || 3306,
    database: process.env.DB,
});

export default pool;

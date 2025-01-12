import { createPool } from 'mysql2';
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
    port: Number(process.env.DB_PORT) || 3306,
    database: process.env.DB,
    ssl: {
        ca: fs.readFileSync(path.join('db', 'ca.pem')), // Update with the actual path
    },
});

// Test connection
const testConnection = async () => {
    try {
        pool.getConnection();
        console.log('Connected to Aiven MySQL successfully!');
        pool.release();
    } catch (error) {
        console.error('Error connecting to Aiven MySQL:', error.message);
    }
};

testConnection();

export default pool;

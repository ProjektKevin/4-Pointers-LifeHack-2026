import dotenv from 'dotenv';
import pkg from 'pg';

const { Pool } = pkg;

// config the dotenv
dotenv.config();

// Create database connection
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Allow self-signed certs (needed for Neon)
  }
});

// Test the database connection
export const testDBConnection = async (pool) => {
  try {
    const res = await pool.query('SELECT NOW()'); // simple test query
    console.log('✅ Database connected! Current time:', res.rows[0].now);
  } catch (err) {
    console.error('\n❌ Database connection failed: \n', err);
  }
};
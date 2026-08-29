import { pool } from '../services/db.js';

export const fetchSampleData = async (sampleId) => {
  try {
    const query = 'SELECT * FROM sample_table WHERE id = $1';
    const VALUES = [sampleId];

    const result = await pool.query(query, VALUES);

    return result.rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}
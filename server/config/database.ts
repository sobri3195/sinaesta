import { Pool } from 'pg';
import dotenv from 'dotenv';
import logger from '../utils/logger';
import { recordQueryMetric } from '../services/metricsService';
import { sendAlert } from '../services/alertService';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'sinaesta',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
pool.on('connect', () => {
  logger.info('✅ Database connected successfully');
});

pool.on('error', (err) => {
  logger.error({ err }, '❌ Database connection error');
  sendAlert('Database connection error', 'Database connection pool emitted an error.', 'critical');
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    recordQueryMetric({ durationMs: duration, timestamp: Date.now() });
    logger.info({ text, duration, rows: res.rowCount }, 'Executed query');
    return res;
  } catch (error) {
    logger.error({ error, text }, 'Query error');
    throw error;
  }
};

export const getClient = () => pool.connect();

export { pool };
export default pool;

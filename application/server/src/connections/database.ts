import { createPool, Pool } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Declare a shared pool variable to ensure a singleton connection pool
let pool: Pool | undefined;

/**
 * Function: getPool
 * Description: Returns an existing MySQL connection pool or creates a new one if none exists.
 * This function ensures a singleton pattern to avoid multiple connection pool instances.
 * @returns {Pool} A MySQL connection pool.
 */
export const getPool = (): Pool => {
  if (!pool) {
    pool = createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'projectuser',
      password: process.env.DB_PASSWORD || 'abc123',
      database: process.env.DB_NAME || 'ratings_dev_db',
      port: Number(process.env.DB_PORT) || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    console.log('Database connection pool created.');
  }
  return pool;
};

/**
 * Function: connectUserDB
 * Description: Initializes a connection pool based on environment variables.
 * Note: This function is deprecated and should not be used alongside `getPool`.
 * @deprecated Use `getPool` instead for consistent pool management.
 */
export const connectUserDB = (): void => {
  if (!pool) {
    console.warn('connectUserDB is deprecated. Please use getPool instead.');
    pool = createPool({
      host: process.env.HOST || 'localhost',
      user: process.env.USER_STRING || 'root',
      password: process.env.PASSWORD || '',
      database: process.env.DATABASE || 'test',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    console.log('Legacy database connection pool created.');
  }
};

/**
 * Function: closePool
 * Description: Closes the database connection pool if it exists.
 * This is useful for testing or application shutdown to release resources.
 */
export const closePool = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = undefined;
    console.log('Database connection pool closed.');
  } else {
    console.warn('No active database pool to close.');
  }
};


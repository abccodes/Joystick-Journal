import { createPool, Pool } from 'mysql2/promise';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

let pool: Pool | undefined;

/**
 * Function: connectUserDB
 * Description: Initializes a connection pool to the database based on the current environment (development, test, or production).
 * Note: This function is marked as deprecated and may conflict with the `getPool` implementation.
 * @deprecated Retained for legacy purposes; consider using `getPool` for consistency.
 */
function connectUserDB() {
  if (!pool) {
    try {
      if (
        process.env.NODE_ENV === 'development' ||
        process.env.NODE_ENV === 'test'
      ) {
        // Configuration for development or test environments
        pool = createPool({
          host: process.env.DEV_HOST,
          user: process.env.DEV_USER_STRING,
          password: process.env.DEV_PASSWORD || '',
          database: process.env.DEV_DATABASE,
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0,
        });
      } else {
        // Configuration for production environment
        pool = createPool({
          host: process.env.HOST,
          user: process.env.USER_STRING,
          password: process.env.PASSWORD || '',
          database: process.env.DATABASE,
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0,
        });
      }
      if (pool) {
        console.log(`${process.env.NODE_ENV} connection pool created`);
      }
    } catch (error) {
      console.error('Error creating connection pool:', error);
    }
  }
}

/**
 * Function: getPool
 * Description: Creates and returns a MySQL connection pool based on the default or environment-provided configurations.
 * This function operates independently of the legacy `connectUserDB`.
 * @returns {Pool} A MySQL connection pool.
 */
export const getPool: () => Pool = () => {
  return mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'test',
    port: Number(process.env.DB_PORT) || 3306,
  });
};

// Exporting the legacy `connectUserDB` function for backward compatibility
export { connectUserDB };

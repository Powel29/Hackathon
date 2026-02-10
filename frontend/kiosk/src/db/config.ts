/**
 * Database Configuration
 * 
 * This file contains the PostgreSQL database connection configuration.
 * To enable database functionality:
 * 1. Install required packages: npm install pg dotenv
 * 2. Create a .env file with your database credentials
 * 3. Uncomment the Pool import and configuration below
 */

// import { Pool } from 'pg';

interface DbConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  max: number; // Maximum number of clients in the pool
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
}

// Database configuration from environment variables
const dbConfig: DbConfig = {
  host: import.meta.env.VITE_DB_HOST || 'localhost',
  port: parseInt(import.meta.env.VITE_DB_PORT || '5432'),
  database: import.meta.env.VITE_DB_NAME || 'suvidha_db',
  user: import.meta.env.VITE_DB_USER || 'postgres',
  password: import.meta.env.VITE_DB_PASSWORD || '',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Create PostgreSQL connection pool
// Uncomment when ready to use database
// export const pool = new Pool(dbConfig);

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    // Uncomment when ready to use database
    // const client = await pool.connect();
    // const result = await client.query('SELECT NOW()');
    // client.release();
    // console.log('Database connected successfully:', result.rows[0]);
    // return true;
    
    console.log('Database connection is not configured yet. See /db/config.ts');
    return false;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}

// Query helper function with error handling
export async function query(text: string, params?: any[]) {
  try {
    // Uncomment when ready to use database
    // const start = Date.now();
    // const result = await pool.query(text, params);
    // const duration = Date.now() - start;
    // console.log('Executed query:', { text, duration, rows: result.rowCount });
    // return result;
    
    console.log('Database query:', { text, params });
    throw new Error('Database not configured. Using mock data.');
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Transaction helper
export async function transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
  // Uncomment when ready to use database
  // const client = await pool.connect();
  // try {
  //   await client.query('BEGIN');
  //   const result = await callback(client);
  //   await client.query('COMMIT');
  //   return result;
  // } catch (error) {
  //   await client.query('ROLLBACK');
  //   throw error;
  // } finally {
  //   client.release();
  // }
  
  throw new Error('Database not configured. Using mock data.');
}

export default dbConfig;

/**
 * Connects to the PostgreSQL database using the pg library. It exports a pool instance for executing queries and a connectDB function to test the connection.
 */

import pkg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pkg

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

export async function connectDB (retries = 5) {
  while (retries) {
    try {
      await pool.query('SELECT 1')
      console.log('Database connected ✅')
      return
    } catch (err) {
      console.log('DB not ready, retrying...')
      retries--
      await new Promise(resolve => setTimeout(resolve, 3000))
    }
  }

  throw new Error('Could not connect to DB ❌')
}

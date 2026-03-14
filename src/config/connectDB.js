/** 
 * Connects to the PostgreSQL database using the pg library. It exports a pool instance for executing queries and a connectDB function to test the connection.
*/

import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const connectDB = async () => {
  try {
    await pool.query("SELECT 1");
    console.log("PostgreSQL connected ✅");
  } catch (err) {
    console.error("Connection failed ❌", err);
    process.exit(1);
  }
};
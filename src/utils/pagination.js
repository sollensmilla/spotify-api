import { pool } from "../config/connectDB.js";

export const paginate = async (table, limit, offset) => {
    const totalRes = await pool.query(`SELECT COUNT(*) FROM ${table}`);
    const total = parseInt(totalRes.rows[0].count, 10);

    const res = await pool.query(
        `SELECT * FROM ${table} LIMIT $1 OFFSET $2`,
        [limit, offset]
    );

    return {
        total,
        limit,
        offset,
        items: res.rows
    };
};
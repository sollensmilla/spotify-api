import DataLoader from "dataloader";
import { pool } from "../../config/connectDB.js";

export const albumLoader = new DataLoader(async (albumIds) => {
    const res = await pool.query(
        "SELECT * FROM albums WHERE id = ANY($1)",
        [albumIds]
    );
    const map = {};
    res.rows.forEach(a => map[a.id] = a);
    return albumIds.map(id => map[id] || null);
});
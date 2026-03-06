import DataLoader from "dataloader";
import { pool } from "../../config/connectDB.js";

export const artistLoader = new DataLoader(async (artistIds) => {
    const res = await pool.query(
        "SELECT * FROM artists WHERE id = ANY($1)",
        [artistIds]
    );
    const map = {};
    res.rows.forEach(a => map[a.id] = a);
    return artistIds.map(id => map[id] || null);
});
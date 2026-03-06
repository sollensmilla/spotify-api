import DataLoader from "dataloader";
import { pool } from "../../config/connectDB.js";

export const trackArtistsLoader = new DataLoader(async (trackIds) => {
    const res = await pool.query(
        `SELECT ta.track_id, a.*
     FROM track_artists ta
     JOIN artists a ON ta.artist_id = a.id
     WHERE ta.track_id = ANY($1)`,
        [trackIds]
    );

    const map = {};
    trackIds.forEach(id => map[id] = []);
    res.rows.forEach(r => map[r.track_id].push(r));
    return trackIds.map(id => map[id]);
});
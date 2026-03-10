import { pool } from "../../config/connectDB.js";

export const artistResolver = {

    Query: {
        artists: async (_, { limit = 20, offset = 0 }) => {
            try {
                const totalRes = await pool.query(`SELECT COUNT(*) FROM artists`);
                const total = parseInt(totalRes.rows[0].count, 10);

                const res = await pool.query(
                    `SELECT * FROM artists
             LIMIT $1 OFFSET $2`,
                    [limit, offset]
                );

                return {
                    total,
                    limit,
                    offset,
                    items: res.rows
                };

            } catch (err) {
                throw new Error("Failed to fetch artists");
            }
        },

        artist: async (_, { id }) => {
            try {
                const res = await pool.query(
                    `SELECT * FROM artists WHERE id=$1`,
                    [id]
                );

                if (!res.rows[0]) {
                    throw new Error("Artist not found");
                }

                return res.rows[0];

            } catch (err) {
                throw new Error("Database query failed");
            }
        }
    },

    Artist: {
        tracks: async (artist) => {
            try {
                const res = await pool.query(
                    `SELECT t.*
             FROM tracks t
             JOIN track_artists ta ON ta.track_id = t.id
             WHERE ta.artist_id=$1`,
                    [artist.id]
                );

                return res.rows;

            } catch (err) {
                throw new Error("Failed to fetch artist tracks");
            }
        }
    }

};
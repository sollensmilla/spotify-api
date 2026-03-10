import { pool } from "../../config/connectDB.js";

export const albumResolver = {

    Query: {
        albums: async (_, { limit = 20, offset = 0 }) => {
            try {
                const totalRes = await pool.query(`SELECT COUNT(*) FROM albums`);
                const total = parseInt(totalRes.rows[0].count, 10);

                const res = await pool.query(
                    `SELECT * FROM albums
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
                throw new Error("Failed to fetch albums");
            }
        },

        album: async (_, { id }) => {
            try {
                const res = await pool.query(
                    `SELECT * FROM albums WHERE id=$1`,
                    [id]
                );

                if (!res.rows[0]) {
                    throw new Error("Album not found");
                }

                return res.rows[0];

            } catch (err) {
                throw new Error("Database query failed");
            }
        }
    },

    Album: {
        tracks: async (album) => {

            const res = await pool.query(
                `SELECT * FROM tracks WHERE album_id=$1`,
                [album.id]
            );

            return res.rows;
        },

        artists: async (album) => {
            try {
                const res = await pool.query(
                    `SELECT DISTINCT a.*
         FROM tracks t
         JOIN track_artists ta ON t.id = ta.track_id
         JOIN artists a ON ta.artist_id = a.id
         WHERE t.album_id=$1`,
                    [album.id]
                );

                if (!res.rows[0]) {
                    throw new Error("Album not found");
                }

                return res.rows;
            } catch (err) {
                throw new Error("Failed to fetch artist tracks");
            }
        }
    }

};
import { pool } from "../../config/connectDB.js";

export const artistResolver = {

    Query: {

        artists: async (_, { limit = 20, offset = 0 }) => {
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
        },

        artist: async (_, { id }) => {

            const res = await pool.query(
                `SELECT * FROM artists WHERE id=$1`,
                [id]
            );

            return res.rows[0];
        }

    },

    Artist: {

        tracks: async (artist) => {

            const res = await pool.query(
                `SELECT t.*
         FROM tracks t
         JOIN track_artists ta ON ta.track_id = t.id
         WHERE ta.artist_id=$1`,
                [artist.id]
            );

            return res.rows;
        }

    }

};
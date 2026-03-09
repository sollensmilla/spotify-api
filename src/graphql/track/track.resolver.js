import { pool } from "../../config/connectDB.js";

export const trackResolver = {

    Query: {

        tracks: async (_, { limit = 20, offset = 0, genre }) => {

            let query = `SELECT * FROM tracks`;
            const values = [];

            if (genre) {
                values.push(genre);
                query += ` WHERE track_genre = $${values.length}`;
            }

            values.push(limit);
            values.push(offset);

            query += ` LIMIT $${values.length - 1} OFFSET $${values.length}`;

            const res = await pool.query(query, values);

            return res.rows;
        },

        track: async (_, { id }) => {

            const res = await pool.query(
                `SELECT * FROM tracks WHERE id=$1`,
                [id]
            );

            return res.rows[0];
        }

    },

    Track: {

        album: async (track, _, { loaders }) => {
            return loaders.albumLoader.load(track.album_id);
        },

        artists: async (track, _, { loaders }) => {
            return loaders.trackArtistsLoader.load(track.id);
        }

    }

};
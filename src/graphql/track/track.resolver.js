import { pool } from "../../config/connectDB.js";

export const trackResolver = {

    Query: {

        tracks: async (_, args) => {
            const {
                name,
                genre,
                minPopularity,
                minDanceability,
                minEnergy,
                minAcousticness,
                limit = 20,
                offset = 0
            } = args;

            let baseQuery = "SELECT * FROM tracks WHERE 1=1";
            const values = [];

            if (name) {
                values.push(`%${name}%`);
                baseQuery += ` AND track_name ILIKE $${values.length}`;
            }

            if (genre) {
                values.push(genre);
                baseQuery += ` AND track_genre = $${values.length}`;
            }

            if (minPopularity) {
                values.push(minPopularity);
                baseQuery += ` AND popularity >= $${values.length}`;
            }

            if (minDanceability) {
                values.push(minDanceability);
                baseQuery += ` AND danceability >= $${values.length}`;
            }

            if (minEnergy) {
                values.push(minEnergy);
                baseQuery += ` AND energy >= $${values.length}`;
            }

            if (minAcousticness) {
                values.push(minAcousticness);
                baseQuery += ` AND acousticness >= $${values.length}`;
            }

            const totalRes = await pool.query(`SELECT COUNT(*) FROM (${baseQuery}) AS subquery`, values);
            const total = parseInt(totalRes.rows[0].count, 10);

            values.push(limit);
            values.push(offset);
            const paginatedQuery = `${baseQuery} LIMIT $${values.length - 1} OFFSET $${values.length}`;

            const res = await pool.query(paginatedQuery, values);

            return {
                total,
                limit,
                offset,
                items: res.rows
            };
        },

        track: async (_, { id }) => {
            const res = await pool.query(
                `SELECT * FROM tracks WHERE id=$1`,
                [id]
            );
            return res.rows[0];
        }

    },

    Mutation: {

        addTrack: async (_, args) => {

            const res = await pool.query(
                `INSERT INTO tracks (track_name, album_id, track_genre, popularity)
         VALUES ($1,$2,$3,$4)
         RETURNING *`,
                [
                    args.track_name,
                    args.album_id,
                    args.genre,
                    args.popularity
                ]
            );

            return res.rows[0];
        },

        updateTrack: async (_, { id, ...fields }) => {

            const keys = Object.keys(fields);

            const set = keys.map((k, i) => `${k}=$${i + 2}`).join(", ");

            const values = [id, ...Object.values(fields)];

            const res = await pool.query(
                `UPDATE tracks
         SET ${set}
         WHERE id=$1
         RETURNING *`,
                values
            );

            return res.rows[0];
        },

        deleteTrack: async (_, { id }) => {

            await pool.query(
                `DELETE FROM tracks WHERE id=$1`,
                [id]
            );

            return true;
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
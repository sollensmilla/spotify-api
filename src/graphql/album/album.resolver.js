import { pool } from "../../config/connectDB.js";
import { paginate } from "../../utils/pagination.js";
import { requireRow } from "../../utils/requireRow.js";

export const albumResolver = {

    Query: {
        albums: (_, { limit = 20, offset = 0 }) =>
            paginate("albums", limit, offset),

        album: async (_, { id }) => {
            const res = await pool.query(
                `SELECT * FROM albums WHERE id=$1`,
                [id]
            );

            return requireRow(res, "Album not found");
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
            const res = await pool.query(
                `SELECT DISTINCT a.*
         FROM tracks t
         JOIN track_artists ta ON t.id = ta.track_id
         JOIN artists a ON ta.artist_id = a.id
         WHERE t.album_id=$1`,
                [album.id]
            );

            return res.rows;
        }
    }
};
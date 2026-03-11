import { pool } from "../../config/connectDB.js";
import { paginate } from "../../utils/pagination.js";
import { requireRow } from "../../utils/requireRow.js";

export const artistResolver = {

    Query: {
        artists: (_, { limit = 20, offset = 0 }) =>
            paginate("artists", limit, offset),

        artist: async (_, { id }) => {
            const res = await pool.query(
                `SELECT * FROM artists WHERE id=$1`,
                [id]
            );

            return requireRow(res, "Artist not found");
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
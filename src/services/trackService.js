/** 
 * Service class for handling track-related database operations.
*/

import { requireRow } from "../utils/requireRow.js";

export class TrackService {

    constructor(pool) {
        this.pool = pool
    }

    async getTracks(args) {

        const {
            filter = {},
            limit = 20,
            offset = 0
        } = args;

        const {
            name,
            genre,
            minPopularity,
            maxPopularity,
            minDanceability,
            maxDanceability,
            minEnergy,
            maxEnergy,
            minAcousticness,
            maxAcousticness,
            minTempo,
            maxTempo,
            key,
            explicit
        } = filter;

        let baseQuery = "SELECT * FROM tracks WHERE 1=1"
        const values = []

        if (name) {
            values.push(`%${name}%`)
            baseQuery += ` AND track_name ILIKE $${values.length}`
        }

        if (genre) {
            values.push(genre)
            baseQuery += ` AND track_genre = $${values.length}`
        }

        if (minPopularity) {
            values.push(minPopularity);
            baseQuery += ` AND popularity >= $${values.length}`;
        }

        if (maxPopularity) {
            values.push(maxPopularity);
            baseQuery += ` AND popularity <= $${values.length}`;
        }

        if (minDanceability) {
            values.push(minDanceability);
            baseQuery += ` AND danceability >= $${values.length}`;
        }

        if (maxDanceability) {
            values.push(maxDanceability);
            baseQuery += ` AND danceability <= $${values.length}`;
        }

        if (minEnergy) {
            values.push(minEnergy);
            baseQuery += ` AND energy >= $${values.length}`;
        }

        if (maxEnergy) {
            values.push(maxEnergy);
            baseQuery += ` AND energy <= $${values.length}`;
        }

        if (minAcousticness) {
            values.push(minAcousticness);
            baseQuery += ` AND acousticness >= $${values.length}`;
        }

        if (maxAcousticness) {
            values.push(maxAcousticness);
            baseQuery += ` AND acousticness <= $${values.length}`;
        }

        if (minTempo) {
            values.push(minTempo);
            baseQuery += ` AND tempo >= $${values.length}`;
        }

        if (maxTempo) {
            values.push(maxTempo);
            baseQuery += ` AND tempo <= $${values.length}`;
        }

        if (key !== undefined) {
            values.push(key);
            baseQuery += ` AND key = $${values.length}`;
        }

        if (explicit !== undefined) {
            values.push(explicit);
            baseQuery += ` AND explicit = $${values.length}`;
        }

        const totalRes = await this.pool.query(
            `SELECT COUNT(*) FROM (${baseQuery}) AS filtered`,
            values
        )

        const total = parseInt(totalRes.rows[0].count, 10)

        values.push(limit)
        values.push(offset)

        const paginatedQuery =
            `${baseQuery} LIMIT $${values.length - 1} OFFSET $${values.length}`

        const res = await this.pool.query(paginatedQuery, values)

        return {
            total,
            limit,
            offset,
            items: res.rows
        }
    }

    async getTrack(id) {
        const res = await this.pool.query(
            `SELECT * FROM tracks WHERE id=$1`,
            [id]
        )

        return requireRow(res, "Track not found")
    }

    async addTrack({ track_name, album_id, genre, popularity }) {

        const res = await this.pool.query(
            `INSERT INTO tracks (track_name, album_id, track_genre, popularity)
         VALUES ($1,$2,$3,$4)
         RETURNING *`,
            [track_name, album_id, genre, popularity]
        );

        return res.rows[0];
    }

    async updateTrack({ id, track_name, popularity }) {

        const res = await this.pool.query(
            `UPDATE tracks
         SET track_name = COALESCE($2, track_name),
             popularity = COALESCE($3, popularity)
         WHERE id = $1
         RETURNING *`,
            [id, track_name, popularity]
        );

        return requireRow(res, "Track not found");
    }

    async deleteTrack(id) {

        const res = await this.pool.query(
            `DELETE FROM tracks
         WHERE id=$1
         RETURNING id`,
            [id]
        );

        requireRow(res, "Track not found");

        return true;
    }
}
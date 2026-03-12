import { requireRow } from "../utils/requireRow.js";

export class TrackService {

    constructor(pool) {
        this.pool = pool
    }

    async getTracks(args) {

        const {
            name,
            genre,
            minPopularity,
            minDanceability,
            minEnergy,
            minAcousticness,
            limit = 20,
            offset = 0
        } = args

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
}
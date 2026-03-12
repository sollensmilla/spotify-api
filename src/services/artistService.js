import { requireRow } from "../utils/requireRow.js";
import { paginate } from "../utils/pagination.js";

export class ArtistService {

    constructor(pool) {
        this.pool = pool;
    }

    async getArtists(limit, offset) {
        return paginate(this.pool, "artists", limit, offset);
    }

    async getArtist(id) {
        const res = await this.pool.query(
            `SELECT * FROM artists WHERE id=$1`,
            [id]
        );

        return requireRow(res, "Artist not found");
    }

    async getTracksByArtist(artistId) {
        const res = await this.pool.query(
            `SELECT t.*
       FROM tracks t
       JOIN track_artists ta ON ta.track_id = t.id
       WHERE ta.artist_id=$1`,
            [artistId]
        );

        return res.rows;
    }
}
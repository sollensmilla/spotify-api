import { requireRow } from "../utils/requireRow.js";
import { paginate } from "../utils/pagination.js";

export class AlbumService {

    constructor(pool) {
        this.pool = pool;
    }

    async getAlbums(limit, offset) {
        return paginate(this.pool, "albums", limit, offset);
    }

    async getAlbum(id) {
        const res = await this.pool.query(
            `SELECT * FROM albums WHERE id=$1`,
            [id]
        );

        return requireRow(res, "Album not found");
    }

    async getTracksByAlbum(albumId) {

        const res = await this.pool.query(
            `SELECT * FROM tracks WHERE album_id=$1`,
            [albumId]
        );

        return res.rows;
    }

    async getArtistsByAlbum(albumId) {

        const res = await this.pool.query(
            `SELECT DISTINCT a.*
       FROM tracks t
       JOIN track_artists ta ON t.id = ta.track_id
       JOIN artists a ON ta.artist_id = a.id
       WHERE t.album_id=$1`,
            [albumId]
        );

        return res.rows;
    }
}
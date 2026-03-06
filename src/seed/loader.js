import { pool } from "../config/connectDB.js";
import { bulkInsert } from "./utils/bulkInsert.js";

export async function clearTables() {
    await pool.query("DELETE FROM track_artists");
    await pool.query("DELETE FROM tracks");
    await pool.query("DELETE FROM artists");
    await pool.query("DELETE FROM albums");
}

export async function loadData({ albums, artists, tracks }) {

    console.log("Inserting albums...");
    await bulkInsert(
        pool,
        "albums",
        ["id", "album_name", "total_tracks"],
        albums
    );

    console.log("Inserting artists...");
    await bulkInsert(
        pool,
        "artists",
        ["id", "artist_name", "genres", "total_tracks", "average_popularity"],
        artists
    );

    console.log("Inserting tracks...");
    await bulkInsert(
        pool,
        "tracks",
        [
            "id",
            "track_name",
            "album_id",
            "track_genre",
            "duration_ms",
            "popularity",
            "key",
            "explicit",
            "tempo",
            "danceability",
            "energy",
            "acousticness",
            "instrumentalness"
        ],
        tracks
    );

    console.log("Inserting track_artists...");

    const relations = [];

    tracks.forEach(track => {
        track.artists.forEach(artistId => {
            relations.push({
                track_id: track.id,
                artist_id: artistId
            });
        });
    });

    await bulkInsert(
        pool,
        "track_artists",
        ["track_id", "artist_id"],
        relations
    );
}
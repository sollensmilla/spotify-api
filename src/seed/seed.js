import fs from "fs";
import csv from "csv-parser";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import pkg from "pg";

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

console.log("PostgreSQL connected ✅");

await pool.query("DELETE FROM track_artists");
await pool.query("DELETE FROM tracks");
await pool.query("DELETE FROM artists");
await pool.query("DELETE FROM albums");

console.log("Tables cleared ✅");

const albumMap = new Map();
const artistMap = new Map();
const tracks = [];

const csvFilePath = "./data/spotify_dataset.csv";

fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on("data", (row) => {
    const trackId = uuidv4();

    const track = {
      id: trackId,
      track_name: row.track_name,
      album_name: row.album_name,
      track_genre: row.track_genre,
      duration_ms: parseInt(row.duration_ms) || 0,
      popularity: parseInt(row.popularity) || 0,
      key: parseInt(row.key) || -1,
      explicit: row.explicit?.toLowerCase() === "true",
      tempo: parseFloat(row.tempo) || 0,
      danceability: parseFloat(row.danceability) || 0,
      energy: parseFloat(row.energy) || 0,
      acousticness: parseFloat(row.acousticness) || 0,
      instrumentalness: parseFloat(row.instrumentalness) || 0,
      artists: [],
    };

    const artistNames = row.artists
      .split(";")
      .map((a) => a.trim())
      .filter(Boolean);

    artistNames.forEach((artistName) => {
      if (!artistMap.has(artistName)) {
        artistMap.set(artistName, {
          id: uuidv4(),
          artist_name: artistName,
          genres: row.track_genre ? [row.track_genre] : [],
          total_tracks: 1,
          average_popularity: parseFloat(row.popularity) || 0,
        });
      } else {
        const artist = artistMap.get(artistName);
        artist.total_tracks += 1;

        artist.average_popularity =
          (artist.average_popularity * (artist.total_tracks - 1) +
            parseFloat(row.popularity || 0)) /
          artist.total_tracks;

        if (
          row.track_genre &&
          !artist.genres.includes(row.track_genre)
        ) {
          artist.genres.push(row.track_genre);
        }
      }

      track.artists.push(artistMap.get(artistName).id);
    });

    if (!albumMap.has(row.album_name)) {
      albumMap.set(row.album_name, {
        id: uuidv4(),
        album_name: row.album_name,
        total_tracks: 1,
      });
    } else {
      albumMap.get(row.album_name).total_tracks += 1;
    }

    track.album_id = albumMap.get(row.album_name).id;

    tracks.push(track);
  })
  .on("end", async () => {
    console.log("CSV processed ✅");

    try {
      for (const album of albumMap.values()) {
        await pool.query(
          `INSERT INTO albums (id, album_name, total_tracks)
           VALUES ($1, $2, $3)`,
          [album.id, album.album_name, album.total_tracks]
        );
      }

      for (const artist of artistMap.values()) {
        await pool.query(
          `INSERT INTO artists (id, artist_name, genres, total_tracks, average_popularity)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            artist.id,
            artist.artist_name,
            artist.genres,
            artist.total_tracks,
            artist.average_popularity,
          ]
        );
      }

      for (const track of tracks) {
        await pool.query(
          `INSERT INTO tracks (
            id, track_name, album_id, track_genre,
            duration_ms, popularity, key, explicit,
            tempo, danceability, energy,
            acousticness, instrumentalness
          )
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
          [
            track.id,
            track.track_name,
            track.album_id,
            track.track_genre,
            track.duration_ms,
            track.popularity,
            track.key,
            track.explicit,
            track.tempo,
            track.danceability,
            track.energy,
            track.acousticness,
            track.instrumentalness,
          ]
        );

        for (const artistId of track.artists) {
          await pool.query(
            `INSERT INTO track_artists (track_id, artist_id)
             VALUES ($1, $2)`,
            [track.id, artistId]
          );
        }
      }

      console.log("✅ Seed finished!");
      console.log(`Tracks: ${tracks.length}`);
      console.log(`Albums: ${albumMap.size}`);
      console.log(`Artists: ${artistMap.size}`);
    } catch (err) {
      console.error("Seeding error ❌", err);
    } finally {
      await pool.end();
    }
  });
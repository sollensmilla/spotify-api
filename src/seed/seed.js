import fs from "fs";
import csv from "csv-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

import Track from "../models/Track.js";
import Album from "../models/Album.js";
import Artist from "../models/Artist.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

await mongoose.connect(MONGO_URI);
console.log("MongoDB connected ✅");

// Rensa databasen först
await Track.deleteMany({});
await Album.deleteMany({});
await Artist.deleteMany({});
console.log("Collections cleared ✅");

// Maps för unika album och artists
const albumMap = new Map();  // nyckel: album_name
const artistMap = new Map(); // nyckel: artist_name
const tracks = [];

const csvFilePath = "./data/spotify_dataset.csv";

fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on("data", (row) => {
    // --- Track ---
    const track = {
      track_id: row.track_id || uuidv4(),
      track_name: row.track_name,
      artists: [],      // kommer fyllas med artist_ids
      album_id: null,   // kommer fyllas med album_id
      album_name: row.album_name,
      track_genre: row.track_genre,
      duration_ms: parseInt(row.duration_ms) || 0,
      popularity: parseInt(row.popularity) || 0,
      key: parseInt(row.key) || -1,
      explicit: row.explicit.toLowerCase() === "true",
      tempo: parseFloat(row.tempo) || 0,
      danceability: parseFloat(row.danceability) || 0,
      energy: parseFloat(row.energy) || 0,
      acousticness: parseFloat(row.acousticness) || 0,
      instrumentalness: parseFloat(row.instrumentalness) || 0,
    };

    // --- Artists ---
    const artistNames = row.artists
      .split(";")
      .map(a => a.trim())
      .filter(Boolean);

    const artistIds = [];

    artistNames.forEach((artistName) => {
      let artist;
      if (!artistMap.has(artistName)) {
        artist = new Artist({
          artist_id: uuidv4(),
          artist_name: artistName,
          genres: row.track_genre ? [row.track_genre] : [],
          total_tracks: 1,
          average_popularity: parseFloat(row.popularity),
        });
        artistMap.set(artistName, artist);
      } else {
        artist = artistMap.get(artistName);
        artist.total_tracks += 1;
        artist.average_popularity =
          (artist.average_popularity * (artist.total_tracks - 1) + parseFloat(row.popularity)) /
          artist.total_tracks;

        if (row.track_genre && !artist.genres.includes(row.track_genre)) {
          artist.genres.push(row.track_genre);
        }
      }
      artistIds.push(artist.artist_id);
      track.artists.push(artist.artist_id);
    });

    // --- Album (unik per album_name) ---
    const albumKey = row.album_name;
    let album;
    if (!albumMap.has(albumKey)) {
      album = new Album({
        album_id: uuidv4(),
        album_name: row.album_name,
        total_tracks: 1,
      });
      albumMap.set(albumKey, album);
    } else {
      album = albumMap.get(albumKey);
      album.total_tracks += 1;
    }

    track.album_id = album.album_id;
    tracks.push(track);
  })
  .on("end", async () => {
    console.log(`CSV file processed ✅`);
    console.log(`Tracks collected: ${tracks.length}`);
    console.log(`Albums collected: ${albumMap.size}`);
    console.log(`Artists collected: ${artistMap.size}`);

    try {
      // Spara allt i DB
      await Album.insertMany(Array.from(albumMap.values()));
      await Artist.insertMany(Array.from(artistMap.values()));
      await Track.insertMany(tracks);

      console.log("✅ Seed finished! Database populated:");
      console.log(`Tracks inserted: ${tracks.length}`);
      console.log(`Albums inserted: ${albumMap.size}`);
      console.log(`Artists inserted: ${artistMap.size}`);
    } catch (err) {
      console.error("Error seeding database:", err);
    } finally {
      mongoose.connection.close();
    }
  });
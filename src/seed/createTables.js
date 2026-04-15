/**
 * Creates the PostgreSQL schema.
 */

export async function createTables (pool) {
  console.log('Creating database schema...')

  await pool.query(`
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS albums (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      album_name TEXT NOT NULL,
      total_tracks INTEGER DEFAULT 0
    );
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS artists (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      artist_name TEXT NOT NULL,
      genres TEXT[],
      total_tracks INTEGER DEFAULT 0,
      average_popularity DOUBLE PRECISION DEFAULT 0
    );
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tracks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      track_name TEXT NOT NULL,
      track_genre TEXT,
      duration_ms INTEGER,
      popularity INTEGER,
      key INTEGER,
      explicit BOOLEAN,
      tempo DOUBLE PRECISION,
      danceability DOUBLE PRECISION,
      energy DOUBLE PRECISION,
      acousticness DOUBLE PRECISION,
      instrumentalness DOUBLE PRECISION,
      spotify_id TEXT,
      image_url TEXT
    );
  `)

  await pool.query(`
  CREATE INDEX IF NOT EXISTS idx_tracks_genre
  ON tracks(track_genre);
`)

  await pool.query(`
  CREATE INDEX IF NOT EXISTS idx_tracks_popularity
  ON tracks(popularity);
`)

  await pool.query(`
  CREATE INDEX IF NOT EXISTS idx_tracks_danceability
  ON tracks(danceability);
`)

  await pool.query(`
  CREATE INDEX IF NOT EXISTS idx_tracks_energy
  ON tracks(energy);
`)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS track_artists (
      track_id UUID NOT NULL,
      artist_id UUID NOT NULL,
      PRIMARY KEY (track_id, artist_id),
      FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE,
      FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE
    );
  `)

  await pool.query(`
  CREATE INDEX IF NOT EXISTS idx_track_artists_artist
  ON track_artists(artist_id);
`)

  await pool.query(`
  CREATE INDEX IF NOT EXISTS idx_track_artists_track
  ON track_artists(track_id);
`)

  await pool.query(`
  CREATE TABLE IF NOT EXISTS track_albums (
    track_id UUID NOT NULL,
    album_id UUID NOT NULL,
    PRIMARY KEY (track_id, album_id),
    FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE,
    FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE
  );
`)

  await pool.query(`
  CREATE INDEX IF NOT EXISTS idx_track_albums_track
  ON track_albums(track_id);
`)

  await pool.query(`
  CREATE INDEX IF NOT EXISTS idx_track_albums_album
  ON track_albums(album_id);
`)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );
  `)

  console.log('Schema ready.')
}

/**
 * This module contains the transformation logic for converting raw CSV data into structured formats suitable for insertion into the PostgreSQL database.
 */

import { v4 as uuidv4 } from 'uuid'

export function transformData (rows) {
  const albumMap = new Map()
  const artistMap = new Map()
  const trackMap = new Map()

  rows.forEach((row) => {
    const spotifyId = row.track_id
    const popularity = parseInt(row.popularity) || 0

    if (!trackMap.has(spotifyId)) {
      trackMap.set(spotifyId, {
        id: uuidv4(),
        track_name: row.track_name,
        track_genre: row.track_genre,
        duration_ms: parseInt(row.duration_ms) || 0,
        popularity,
        key: parseInt(row.key) || -1,
        explicit: row.explicit?.toLowerCase() === 'true',
        tempo: parseFloat(row.tempo) || 0,
        danceability: parseFloat(row.danceability) || 0,
        energy: parseFloat(row.energy) || 0,
        acousticness: parseFloat(row.acousticness) || 0,
        instrumentalness: parseFloat(row.instrumentalness) || 0,
        spotify_id: spotifyId,
        image_url: null,
        artists: new Set(),
        albums: new Set()
      })
    }

    const track = trackMap.get(spotifyId)

    track.popularity = Math.max(track.popularity, popularity)

    const artistNames = row.artists
      .split(';')
      .map(a => a.trim())
      .filter(Boolean)

    artistNames.forEach((artistName) => {
      if (!artistMap.has(artistName)) {
        artistMap.set(artistName, {
          id: uuidv4(),
          artist_name: artistName,
          genres: row.track_genre ? [row.track_genre] : [],
          total_tracks: 1,
          average_popularity: popularity
        })
      } else {
        const artist = artistMap.get(artistName)

        artist.total_tracks++

        artist.average_popularity =
          (artist.average_popularity * (artist.total_tracks - 1) + popularity) /
          artist.total_tracks

        if (
          row.track_genre &&
          !artist.genres.includes(row.track_genre)
        ) {
          artist.genres.push(row.track_genre)
        }
      }

      track.artists.add(artistMap.get(artistName).id)
    })

    const albumKey = `${row.album_name}-${row.artists}`

    let albumId
    if (!albumMap.has(albumKey)) {
      albumId = uuidv4()
      albumMap.set(albumKey, {
        id: albumId,
        album_name: row.album_name,
        total_tracks: 1
      })
    } else {
      const album = albumMap.get(albumKey)
      album.total_tracks++
      albumId = album.id
    }

    track.albums.add(albumId)
  })

  const tracks = Array.from(trackMap.values()).map(track => ({
    ...track,
    artists: Array.from(track.artists),
    albums: Array.from(track.albums)
  }))

  return {
    albums: [...albumMap.values()],
    artists: [...artistMap.values()],
    tracks
  }
}

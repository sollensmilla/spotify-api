/**
 * This module contains the transformation logic for converting raw CSV data into structured formats suitable for insertion into the PostgreSQL database.
 */

import { v4 as uuidv4 } from 'uuid'

export function transformData (rows) {
  const albumMap = new Map()
  const artistMap = new Map()
  const tracks = []

  rows.forEach((row) => {
    const trackId = uuidv4()

    const track = {
      id: trackId,
      track_name: row.track_name,
      track_genre: row.track_genre,
      duration_ms: parseInt(row.duration_ms) || 0,
      popularity: parseInt(row.popularity) || 0,
      key: parseInt(row.key) || -1,
      explicit: row.explicit?.toLowerCase() === 'true',
      tempo: parseFloat(row.tempo) || 0,
      danceability: parseFloat(row.danceability) || 0,
      energy: parseFloat(row.energy) || 0,
      acousticness: parseFloat(row.acousticness) || 0,
      instrumentalness: parseFloat(row.instrumentalness) || 0,
      spotify_id: row.track_id,
      image_url: null,
      artists: [],
      albums: []
    }

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
          average_popularity: parseFloat(row.popularity) || 0
        })
      } else {
        const artist = artistMap.get(artistName)

        artist.total_tracks++

        const popularity = parseFloat(row.popularity) || 0

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

      track.artists.push(artistMap.get(artistName).id)
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

    track.albums.push(albumId)

    tracks.push(track)
  })

  return {
    albums: [...albumMap.values()],
    artists: [...artistMap.values()],
    tracks
  }
}

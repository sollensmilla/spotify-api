/**
 * Service class for handling track-related database operations.
 */

import { requireRow } from '../utils/requireRow.js'
import { UserInputError } from 'apollo-server-errors'
import {
  assertUUID,
  validateTrackInput
} from '../utils/validation.js'
import { getTrackImages } from './spotifyService.js'

export class TrackService {
  constructor (pool) {
    this.pool = pool
  }

  async getTracks (args) {
    const {
      filter = {},
      limit = 20,
      offset = 0
    } = args

    if (limit < 0 || offset < 0) {
      throw new UserInputError('limit and offset must be positive')
    }

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
    } = filter

    let baseQuery = 'SELECT * FROM tracks WHERE 1=1'
    const values = []

    if (name) {
      values.push(`%${name}%`)
      baseQuery += ` AND track_name ILIKE $${values.length}`
    }

    if (genre) {
      values.push(genre)
      baseQuery += ` AND track_genre = $${values.length}`
    }

    if (minPopularity !== undefined) {
      values.push(minPopularity)
      baseQuery += ` AND popularity >= $${values.length}`
    }

    if (maxPopularity !== undefined) {
      values.push(maxPopularity)
      baseQuery += ` AND popularity <= $${values.length}`
    }

    if (minDanceability !== undefined) {
      values.push(minDanceability)
      baseQuery += ` AND danceability >= $${values.length}`
    }

    if (maxDanceability !== undefined) {
      values.push(maxDanceability)
      baseQuery += ` AND danceability <= $${values.length}`
    }

    if (minEnergy !== undefined) {
      values.push(minEnergy)
      baseQuery += ` AND energy >= $${values.length}`
    }

    if (maxEnergy !== undefined) {
      values.push(maxEnergy)
      baseQuery += ` AND energy <= $${values.length}`
    }

    if (minAcousticness !== undefined) {
      values.push(minAcousticness)
      baseQuery += ` AND acousticness >= $${values.length}`
    }

    if (maxAcousticness !== undefined) {
      values.push(maxAcousticness)
      baseQuery += ` AND acousticness <= $${values.length}`
    }

    if (minTempo !== undefined) {
      values.push(minTempo)
      baseQuery += ` AND tempo >= $${values.length}`
    }

    if (maxTempo !== undefined) {
      values.push(maxTempo)
      baseQuery += ` AND tempo <= $${values.length}`
    }

    if (key !== undefined) {
      values.push(key)
      baseQuery += ` AND key = $${values.length}`
    }

    if (explicit != null) {
      values.push(explicit)
      baseQuery += ` AND explicit = $${values.length}`
    }

    const totalRes = await this.pool.query(
      `SELECT COUNT(*) FROM (${baseQuery}) AS filtered`,
      values
    )

    const total = parseInt(totalRes.rows[0].count, 10)

    values.push(limit)
    values.push(offset)

    const res = await this.pool.query(
      `${baseQuery}
   ORDER BY popularity DESC
   LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values
    )

    return {
      total,
      limit,
      offset,
      items: res.rows
    }
  }

  async getTrack (id) {
    id = assertUUID(id, 'id')

    const res = await this.pool.query(
      'SELECT * FROM tracks WHERE id=$1',
      [id]
    )

    return requireRow(res, 'Track not found')
  }

  async addTrack (input) {
    if (!input.track_name) {
      throw new UserInputError('track_name is required')
    }

    const validated = validateTrackInput(input)

    if (input.album_ids !== undefined) {
      input.album_ids = input.album_ids.map(id => assertUUID(id, 'album_id'))
    }

    const res = await this.pool.query(
      `INSERT INTO tracks (
        track_name,
        track_genre,
        popularity,
        duration_ms,
        tempo,
        danceability,
        energy,
        acousticness,
        instrumentalness,
        key,
        explicit
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *`,
      [
        validated.track_name,
        validated.track_genre,
        validated.popularity,
        validated.duration_ms,
        validated.tempo,
        validated.danceability,
        validated.energy,
        validated.acousticness,
        validated.instrumentalness,
        validated.key,
        validated.explicit
      ]
    )

    const track = res.rows[0]

    if (input.album_ids?.length) {
      for (const albumId of input.album_ids) {
        await this.pool.query(
          `INSERT INTO track_albums (track_id, album_id)
           VALUES ($1, $2)`,
          [track.id, albumId]
        )
      }
    }

    return track
  }

  async updateTrack ({ id, ...input }) {
    if (!id) {
      throw new UserInputError('id is required')
    }

    id = assertUUID(id, 'id')

    const validated = validateTrackInput(input)

    if (Object.keys(validated).length === 0) {
      throw new UserInputError('At least one field must be provided')
    }

    const res = await this.pool.query(
      `UPDATE tracks SET
        track_name = COALESCE($2, track_name),
        popularity = COALESCE($3, popularity),
        duration_ms = COALESCE($4, duration_ms),
        tempo = COALESCE($5, tempo),
        danceability = COALESCE($6, danceability),
        energy = COALESCE($7, energy),
        acousticness = COALESCE($8, acousticness),
        instrumentalness = COALESCE($9, instrumentalness),
        key = COALESCE($10, key),
        explicit = COALESCE($11, explicit)
      WHERE id = $1
      RETURNING *`,
      [
        id,
        validated.track_name,
        validated.popularity,
        validated.duration_ms,
        validated.tempo,
        validated.danceability,
        validated.energy,
        validated.acousticness,
        validated.instrumentalness,
        validated.key,
        validated.explicit
      ]
    )

    return requireRow(res, 'Track not found')
  }

  async deleteTrack (id) {
    id = assertUUID(id, 'id')

    const res = await this.pool.query(
      `DELETE FROM tracks
       WHERE id=$1
       RETURNING id`,
      [id]
    )

    requireRow(res, 'Track not found')

    return true
  }

  async getGenres () {
    const res = await this.pool.query(`
      SELECT DISTINCT track_genre 
      FROM tracks
      WHERE track_genre IS NOT NULL
      ORDER BY track_genre ASC
    `)

    return res.rows.map(row => row.track_genre)
  }

  async getAnalytics () {
    const genreCountsQuery = `
    SELECT track_genre AS genre, COUNT(*)::int AS count
    FROM tracks
    GROUP BY track_genre
    ORDER BY count DESC
    LIMIT 10;
  `

    const topTracksQuery = `
    SELECT id, track_name, popularity, spotify_id
    FROM tracks
    ORDER BY popularity DESC
    LIMIT 10;
  `

    const topArtistsQuery = `
    SELECT a.artist_name, COUNT(*)::int AS count
    FROM track_artists ta
    JOIN artists a ON ta.artist_id = a.id
    GROUP BY a.artist_name
    ORDER BY count DESC
    LIMIT 10;
  `

    const [genreCountsRes, topTracksRes, topArtistsRes] = await Promise.all([
      this.pool.query(genreCountsQuery),
      this.pool.query(topTracksQuery),
      this.pool.query(topArtistsQuery)
    ])

    const topTracks = topTracksRes.rows

    console.log('TOP TRACK SAMPLE:', topTracks[0])
    console.log('ALL TOP TRACKS:', topTracks)
    console.log('SPOTIFY IDS RAW:', topTracks.map(t => t.spotify_id))

    const spotifyIds = topTracks
      .map(t => t.spotify_id)
      .filter(Boolean)

    let images = {}

    if (spotifyIds.length > 0) {
      images = await getTrackImages(spotifyIds)
    }

    const enrichedTracks = topTracks.map(t => ({
      ...t,
      image_url: images[t.spotify_id] || null
    }))

    console.log('SPOTIFY IDS:', spotifyIds.length)

    return {
      genreCounts: genreCountsRes.rows,
      topTracks: enrichedTracks,
      topArtists: topArtistsRes.rows
    }
  }
}

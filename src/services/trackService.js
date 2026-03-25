/**
 * Service class for handling track-related database operations.
 */

import { requireRow } from '../utils/requireRow.js'
import { UserInputError } from 'apollo-server-errors'
import { assertString, assertNumber, assertBoolean, assertUUID } from '../utils/validation.js'

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
      const explicitVal = assertBoolean(explicit, 'explicit')
      values.push(explicitVal)
      baseQuery += ` AND explicit = $${values.length}`
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

  async getTrack (id) {
    id = assertUUID(id, 'id')

    const res = await this.pool.query(
      'SELECT * FROM tracks WHERE id=$1',
      [id]
    )

    return requireRow(res, 'Track not found')
  }

  async addTrack ({ track_name, album_id, track_genre, popularity }) {
    track_name = assertString(track_name, 'track_name', 1, 100)

    if (album_id !== undefined) {
      album_id = assertUUID(album_id, 'album_id')
    }

    if (track_genre !== undefined) {
      track_genre = assertString(track_genre, 'track_genre', 1, 50)
    }

    if (popularity !== undefined) {
      popularity = assertNumber(popularity, 'popularity', 0, 100)
    }

    const res = await this.pool.query(
      `INSERT INTO tracks (track_name, album_id, track_genre, popularity)
         VALUES ($1,$2,$3,$4)
         RETURNING *`,
      [track_name, album_id, track_genre, popularity]
    )

    return res.rows[0]
  }

  async updateTrack ({ id, track_name, popularity }) {
    if (!id) {
      throw new UserInputError('id is required')
    }

    id = assertUUID(id, 'id')

    if (track_name !== undefined) {
      track_name = assertString(track_name, 'track_name', 1, 100)
    }

    if (popularity !== undefined) {
      popularity = assertNumber(popularity, 'popularity', 0, 100)
    }

    const res = await this.pool.query(
      `UPDATE tracks
         SET track_name = COALESCE($2, track_name),
             popularity = COALESCE($3, popularity)
         WHERE id = $1
         RETURNING *`,
      [id, track_name, popularity]
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
}

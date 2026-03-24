/**
 * Service class for handling artist-related database operations.
 */

import { requireRow } from '../utils/requireRow.js'
import { UserInputError } from 'apollo-server-errors'
import { paginate } from '../utils/pagination.js'

export class ArtistService {
  constructor (pool) {
    this.pool = pool
  }

  async getArtists (limit, offset) {
    if (limit < 0) {
      throw new UserInputError('LIMIT must be >= 0')
    }

    if (offset < 0) {
      throw new UserInputError('Offset must be >= 0')
    }

    return paginate(this.pool, 'artists', limit, offset)
  }

  async getArtist (id) {
    if (!id) {
      throw new UserInputError('Artist id is required')
    }

    const res = await this.pool.query(
      'SELECT * FROM artists WHERE id=$1',
      [id]
    )

    return requireRow(res, 'Artist not found')
  }

  async getTracksByArtist (artistId) {
    if (!artistId) {
      throw new UserInputError('Artist id is required')
    }

    const res = await this.pool.query(
      `SELECT t.*
       FROM tracks t
       JOIN track_artists ta ON ta.track_id = t.id
       WHERE ta.artist_id=$1`,
      [artistId]
    )

    return res.rows
  }
}

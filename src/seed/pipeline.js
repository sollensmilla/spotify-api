/**
 * This module defines the main pipeline for seeding the PostgreSQL database. It orchestrates the extraction, transformation, clearing, and loading into the database.
 */

import { pool } from '../config/connectDB.js'
import { extractCSV } from './extractor.js'
import { transformData } from './transformer.js'
import { createTables } from './createTables.js'
import { clearTables, loadData } from './loader.js'
import { getSpotifyToken, getSpotifyImage } from '../services/spotifyService.js'
import { enrichTracksWithImages } from './enrichers/spotifyEnricher.js'

const sleep = (ms) => new Promise(res => setTimeout(res, ms))

export async function runPipeline(csvPath) {
  console.log('Extracting CSV...')
  const rows = await extractCSV(csvPath)

  console.log('Transforming data...')
  const data = transformData(rows)

  console.log('Fetching Spotify images...')
  await enrichTracksWithImages(data.tracks)

  console.log('Creating tables...')
  await createTables(pool)

  console.log('Clearing tables...')
  await clearTables(pool)

  console.log('Loading database...')
  await loadData(pool, data)

  console.log('Seed complete!')
}

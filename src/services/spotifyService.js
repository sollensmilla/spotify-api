import 'dotenv/config'
import fetch from 'node-fetch'

let cachedToken = null
let tokenExpiresAt = 0

const imageCache = new Map()

export const getSpotifyToken = async () => {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken
  }

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization:
        'Basic ' +
        Buffer.from(
          process.env.SPOTIFY_CLIENT_ID +
          ':' +
          process.env.SPOTIFY_CLIENT_SECRET
        ).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  })

  const data = await res.json()

  cachedToken = data.access_token
  tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000

  return cachedToken
}

export const getTrackImages = async (spotifyIds = []) => {
  if (!spotifyIds.length) return {}

  const validIds = spotifyIds.filter(Boolean)
  const uncached = validIds.filter(id => !imageCache.has(id))

  try {
    if (uncached.length > 0) {
      const token = await getSpotifyToken()

      const res = await fetch(
        `https://api.spotify.com/v1/tracks?ids=${uncached.join(',')}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (!res.ok) {
        console.error('Spotify API error:', res.status, await res.text())
        return {}
      }

      const data = await res.json()

      if (data?.tracks?.length) {
        data.tracks.forEach(track => {
          imageCache.set(
            track.id,
            track.album?.images?.[0]?.url || null
          )
        })
      }
    }
  } catch (err) {
    console.error('Spotify fetch failed:', err)
    return {}
  }

  const result = {}

  validIds.forEach(id => {
    result[id] = imageCache.get(id) || null
  })

  return result
}

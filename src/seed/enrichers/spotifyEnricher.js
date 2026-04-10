import { getSpotifyToken } from '../../services/spotifyService.js'

const sleep = (ms) => new Promise(res => setTimeout(res, ms))

const BATCH_SIZE = 20
const DELAY = 300

export const enrichTracksWithImages = async (tracks) => {
    const token = await getSpotifyToken()

    console.log('First track:', tracks[0])

    for (let i = 0; i < tracks.length; i += BATCH_SIZE) {
        const batch = tracks.slice(i, i + BATCH_SIZE)

        const ids = batch
            .map(t => t.spotify_id?.trim())
            .filter(id => id && id.length === 22)

        if (ids.length === 0) continue

        const res = await fetch(
            `https://api.spotify.com/v1/tracks?ids=${ids.join(',')}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        )

        if (res.status === 429) {
            const retryAfter = parseInt(res.headers.get('Retry-After')) || 5
            console.log(`Rate limited. Waiting ${retryAfter}s...`)
            await sleep(retryAfter * 1000)
            i -= BATCH_SIZE
            continue
        }

        if (!res.ok) {
            const text = await res.text()

            console.log('--- DEBUG START ---')
            console.log('Status:', res.status)
            console.log('Response:', text)

            console.log('IDs:', ids.slice(0, 5))
            console.log('First raw track:', batch[0])

            console.log('--- DEBUG END ---')

            continue
        }

        const data = await res.json()

        const map = new Map()
        batch.forEach(t => map.set(t.spotify_id, t))

        data.tracks.forEach(apiTrack => {
            const track = map.get(apiTrack?.id)
            if (track) {
                track.image_url = apiTrack?.album?.images?.[0]?.url || null
            }
        })

        await sleep(DELAY)
    }
}
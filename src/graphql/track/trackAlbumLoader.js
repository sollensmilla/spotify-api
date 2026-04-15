import DataLoader from 'dataloader'

export const createTrackAlbumsLoader = (pool) =>
  new DataLoader(async (trackIds) => {
    const res = await pool.query(
            `SELECT ta.track_id, a.*
       FROM track_albums ta
       JOIN albums a ON ta.album_id = a.id
       WHERE ta.track_id = ANY($1)`,
            [trackIds]
    )

    const map = {}

    trackIds.forEach(id => {
      map[id] = []
    })

    res.rows.forEach(row => {
      map[row.track_id].push(row)
    })

    return trackIds.map(id => map[id])
  })

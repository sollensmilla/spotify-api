import { v4 as uuidv4 } from "uuid";

export function transformData(rows) {
    const albumMap = new Map();
    const artistMap = new Map();
    const tracks = [];

    rows.forEach((row) => {
        const trackId = uuidv4();

        const track = {
            id: trackId,
            track_name: row.track_name,
            track_genre: row.track_genre,
            duration_ms: parseInt(row.duration_ms) || 0,
            popularity: parseInt(row.popularity) || 0,
            artists: []
        };

        const artistNames = row.artists.split(";").map(a => a.trim());

        artistNames.forEach(name => {
            if (!artistMap.has(name)) {
                artistMap.set(name, {
                    id: uuidv4(),
                    artist_name: name
                });
            }

            track.artists.push(artistMap.get(name).id);
        });

        if (!albumMap.has(row.album_name)) {
            albumMap.set(row.album_name, {
                id: uuidv4(),
                album_name: row.album_name,
                total_tracks: 1
            });
        } else {
            albumMap.get(row.album_name).total_tracks++;
        }

        track.album_id = albumMap.get(row.album_name).id;

        tracks.push(track);
    });

    return {
        albums: [...albumMap.values()],
        artists: [...artistMap.values()],
        tracks
    };
}
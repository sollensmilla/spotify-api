import 'dotenv/config';
import fetch from 'node-fetch';

let cachedToken = null;
let tokenExpiresAt = 0;

export const getSpotifyToken = async () => {
    if (cachedToken && Date.now() < tokenExpiresAt) {
        return cachedToken;
    }

    console.log('CLIENT_ID:', process.env.SPOTIFY_CLIENT_ID);
    console.log('CLIENT_SECRET exists:', !!process.env.SPOTIFY_CLIENT_SECRET);

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
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });

    const data = await res.json();

    console.log('Token response:', data);

    cachedToken = data.access_token;
    tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;

    return cachedToken;
};

export const getSpotifyImage = async (spotifyId, token) => {
    const res = await fetch(
        `https://api.spotify.com/v1/tracks/${spotifyId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!res.ok) {
        console.log(`Spotify API error ${res.status} for id: ${spotifyId}`);
        return null;
    }

    const data = await res.json();

    return data.album?.images?.[0]?.url || null;
};
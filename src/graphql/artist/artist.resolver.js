export const artistResolver = {

    Query: {

        artists: (_, { limit = 20, offset = 0 }, { services }) =>
            services.artistService.getArtists(limit, offset),

        artist: (_, { id }, { services }) =>
            services.artistService.getArtist(id)
    },

    Artist: {

        tracks: (artist, _, { services }) =>
            services.artistService.getTracksByArtist(artist.id)
    }
};
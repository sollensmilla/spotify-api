export const albumResolver = {

    Query: {

        albums: (_, { limit = 20, offset = 0 }, { services }) =>
            services.albumService.getAlbums(limit, offset),

        album: (_, { id }, { services }) =>
            services.albumService.getAlbum(id)
    },

    Album: {

        tracks: (album, _, { services }) =>
            services.albumService.getTracksByAlbum(album.id),

        artists: (album, _, { services }) =>
            services.albumService.getArtistsByAlbum(album.id)
    }
};
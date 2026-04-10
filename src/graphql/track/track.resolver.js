import { requireAuth } from '../../middleware/requireAuth.js'

export const trackResolver = {

  Query: {

    tracks: (_, args, { services }) =>
      services.trackService.getTracks(args),

    track: (_, { id }, { services }) =>
      services.trackService.getTrack(id),

    genres: (_, __, { services }) =>
      services.trackService.getGenres()
  },

  Mutation: {

    addTrack: (_, args, { services, user }) => {
      requireAuth(user)
      return services.trackService.addTrack(args)
    },

    updateTrack: (_, args, { services, user }) => {
      requireAuth(user)
      return services.trackService.updateTrack(args)
    },

    deleteTrack: (_, { id }, { services, user }) => {
      requireAuth(user)
      return services.trackService.deleteTrack(id)
    }
  },

  Track: {
    albums: (track, _, { loaders }) =>
      loaders.trackAlbumsLoader.load(track.id),

    artists: (track, _, { loaders }) =>
      loaders.trackArtistsLoader.load(track.id),

    image_url: async (track) => {
      if (!track.spotify_id) return null

      try {
        const token = await getSpotifyToken()
        return await getSpotifyImage(track.spotify_id, token)
      } catch (err) {
        console.log('Spotify error:', track.spotify_id)
        return null
      }
    }
  }
}

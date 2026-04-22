import { requireAuth } from '../../middleware/requireAuth.js'

export const trackResolver = {

  Query: {

    tracks: (_, args, { services }) =>
      services.trackService.getTracks(args),

    track: (_, { id }, { services }) =>
      services.trackService.getTrack(id),

    genres: (_, __, { services }) =>
      services.trackService.getGenres(),

    analytics: (_, args, { services }) =>
      services.trackService.getAnalytics(args)
  },

  Mutation: {

    addTrack: (_, { input }, { services, user }) => {
      requireAuth(user)
      return services.trackService.addTrack(input)
    },

    updateTrack: (_, { id, input }, { services, user }) => {
      requireAuth(user)
      return services.trackService.updateTrack({
        id,
        ...input
      })
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

    image_url: (track) => track.image_url
  }
}

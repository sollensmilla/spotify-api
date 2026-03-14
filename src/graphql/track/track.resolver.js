import { requireAuth } from "../../middleware/requireAuth.js";

export const trackResolver = {

    Query: {

        tracks: (_, args, { services }) =>
            services.trackService.getTracks(args),

        track: (_, { id }, { services }) =>
            services.trackService.getTrack(id)
    },

    Mutation: {

        addTrack: (_, args, { services, user }) => {
            requireAuth(user);
            return services.trackService.addTrack(args);
        },

        updateTrack: (_, args, { services, user }) => {
            requireAuth(user);
            return services.trackService.updateTrack(args);
        },

        deleteTrack: (_, { id }, { services, user }) => {
            requireAuth(user);
            return services.trackService.deleteTrack(id);
        }
    },

    Track: {
        album: (track, _, { loaders }) =>
            loaders.albumLoader.load(track.album_id),

        artists: (track, _, { loaders }) =>
            loaders.trackArtistsLoader.load(track.id)
    }
}
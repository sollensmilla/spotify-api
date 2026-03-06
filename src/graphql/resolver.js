import { trackResolver } from "./track/track.resolver.js";
import { albumResolver } from "./album/album.resolver.js";
import { artistResolver } from "./artist/artist.resolver.js";

export const resolvers = {
    Query: {
        ...trackResolver.Query,
        ...albumResolver.Query,
        ...artistResolver.Query
    },
    Track: {
        ...trackResolver.Track
    },
    Album: {
        ...albumResolver.Album
    },
    Artist: {
        ...artistResolver.Artist
    }
};
import { trackResolver } from "./track/track.resolver.js";
import { albumResolver } from "./album/album.resolver.js";
import { artistResolver } from "./artist/artist.resolver.js";
import { authResolver } from "./auth/authResolver.js";

export const resolvers = [
    trackResolver,
    albumResolver,
    artistResolver,
    authResolver
];  
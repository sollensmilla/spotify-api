import { trackResolver } from "./track/track.resolver.js";
import { albumResolver } from "./album/album.resolver.js";
import { artistResolver } from "./artist/artist.resolver.js";

export const resolvers = [
    trackResolver,
    albumResolver,
    artistResolver
];
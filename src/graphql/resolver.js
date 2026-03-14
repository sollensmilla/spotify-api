/** 
 * Collects and exports all GraphQL resolvers for the application. Each resolver corresponds to a specific type or functionality, such as tracks, albums, artists, and authentication. See the individual resolver files for implementation details.
*/

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
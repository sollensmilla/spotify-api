/** 
 * Collects and exports all GraphQL type definitions for the application. It includes the root query and mutation types, as well as specific types for tracks, albums, artists, and authentication. See the individual type files for implementation details.
*/

import gql from "graphql-tag";
import { trackType } from "./track/track.type.js";
import { albumType } from "./album/album.type.js";
import { artistType } from "./artist/artist.type.js";
import { authType } from "./auth/authType.js";

const rootQuery = gql`
  type Query {
    _empty: String
  }

    type Mutation {
    _empty: String
  }
`;

export const typeDefs = [rootQuery, trackType, albumType, artistType, authType];
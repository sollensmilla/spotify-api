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
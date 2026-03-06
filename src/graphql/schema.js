import { gql } from "apollo-server-express";
import { trackType } from "./track/track.type.js";
import { albumType } from "./album/album.type.js";
import { artistType } from "./artist/artist.type.js";

const rootQuery = gql`
  type Query {
    _empty: String
  }
`;

export const typeDefs = [rootQuery, trackType, albumType, artistType];
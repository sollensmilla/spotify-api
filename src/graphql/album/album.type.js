import { gql } from "apollo-server-express";

export const albumType = gql`

  type Album {
    id: ID!
    album_name: String!
    total_tracks: Int
    tracks: [Track!]
    artists: [Artist!]
  }

  extend type Query {
    albums(limit: Int, offset: Int): [Album!]!
    album(id: ID!): Album
  }

`;
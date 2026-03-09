import { gql } from "apollo-server-express";

export const artistType = gql`

  type Artist {
    id: ID!
    artist_name: String!
    genres: String
    total_tracks: Int
    average_popularity: Float
    tracks: [Track!]
  }

  extend type Query {
    artists(limit: Int, offset: Int): [Artist!]!
    artist(id: ID!): Artist
  }

`;
import { gql } from "apollo-server-express";

export const trackType = gql`
  type Track {
    id: ID!
    track_name: String!
    album: Album
    artists: [Artist!]
    track_genre: String
    duration_ms: Int
    popularity: Int
    key: Int
    explicit: Boolean
    tempo: Float
    danceability: Float
    energy: Float
    acousticness: Float
    instrumentalness: Float
  }

  extend type Query {
    tracks(limit: Int): [Track!]!
    track(id: ID!): Track
  }
`;
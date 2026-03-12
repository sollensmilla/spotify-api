import gql from "graphql-tag";

export const artistType = gql`

  type Artist {
    id: ID!
    artist_name: String!
    genres: String
    total_tracks: Int
    average_popularity: Float
    tracks: [Track!]
  }

  type ArtistPage {
  total: Int!
  limit: Int!
  offset: Int!
  items: [Artist!]!
  }

  extend type Query {
    artists(limit: Int, offset: Int): ArtistPage!
    artist(id: ID!): Artist
  }

`;
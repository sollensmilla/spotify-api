import { gql } from "apollo-server-express";

export const albumType = gql`

  type Album {
    id: ID!
    album_name: String!
    total_tracks: Int
    tracks: [Track!]
    artists: [Artist!]
  }

  type AlbumPage {
  total: Int!
  limit: Int!
  offset: Int!
  items: [Album!]!
 }

  extend type Query {
    albums(limit: Int, offset: Int): AlbumPage!
    album(id: ID!): Album
  }

`;
import gql from "graphql-tag";

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

  type TrackPage {
    total: Int!
    limit: Int!
    offset: Int!
    items: [Track!]!
  }

   input TrackFilterInput {
    name: String
    genre: String
    minPopularity: Int
    maxPopularity: Int
    minDanceability: Float
    maxDanceability: Float
    minEnergy: Float
    maxEnergy: Float
    minAcousticness: Float
    maxAcousticness: Float
    minTempo: Float
    maxTempo: Float
    key: Int
    explicit: Boolean
  }

extend type Query {
  tracks(
    filter: TrackFilterInput
    limit: Int
    offset: Int
  ): TrackPage!
  track(id: ID!): Track
}

extend type Mutation {
  addTrack(
    track_name: String!
    album_id: ID
    genre: String
    popularity: Int
  ): Track!

  updateTrack(
    id: ID!
    track_name: String
    popularity: Int
  ): Track!

  deleteTrack(id: ID!): Boolean!
}
`;
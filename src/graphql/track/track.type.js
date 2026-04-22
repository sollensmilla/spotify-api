import gql from 'graphql-tag'

export const trackType = gql`
  type Track {
    id: ID!
    track_name: String!
    albums: [Album!]
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
    spotify_id: String   
    image_url: String    
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
    minInstrumentalness: Float
    maxInstrumentalness: Float
    minTempo: Float
    maxTempo: Float
    key: Int
    explicit: Boolean
  }

  input TrackInput {
    track_name: String
    album_ids: [ID!]
    track_genre: String
    popularity: Int

    duration_ms: Int
    tempo: Float
    danceability: Float
    energy: Float
    acousticness: Float
    instrumentalness: Float
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
    genres: [String!]!
    analytics: Analytics! 
  }

  extend type Mutation {
    addTrack(input: TrackInput!): Track!

    updateTrack(
      id: ID!
      input: TrackInput!
    ): Track!

    deleteTrack(id: ID!): Boolean!
  }

  type Analytics {
  genreCounts: [GenreCount!]!
  topTracks: [Track!]!
  topArtists: [TopArtist!]!
  popularityBuckets: [PopularityBucket!]! 
}

type PopularityBucket {
  bucket: String!
  avg_danceability: Float
  avg_energy: Float
  avg_tempo: Float
  avg_acousticness: Float
  avg_instrumentalness: Float
  count: Int!
}

type GenreCount {
  genre: String!
  count: Int!
}

type TopArtist {
  artist_name: String!
  count: Int!
}
`

import { UserInputError } from 'apollo-server-errors'

export const assertString = (value, name, min = 1, max = 255) => {
  if (typeof value !== 'string') {
    throw new UserInputError(`${name} must be a string`)
  }

  const trimmed = value.trim()

  if (trimmed.length < min || trimmed.length > max) {
    throw new UserInputError(`${name} must be ${min}-${max} characters`)
  }

  return trimmed
}

export const assertNumber = (value, name, min = -Infinity, max = Infinity) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new UserInputError(`${name} must be a number`)
  }

  if (value < min || value > max) {
    throw new UserInputError(`${name} must be between ${min} and ${max}`)
  }

  return value
}

export const assertBoolean = (value, name) => {
  if (typeof value !== 'boolean') {
    throw new UserInputError(`${name} must be a boolean`)
  }
  return value
}

export const assertUUID = (value, name) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

  if (typeof value !== 'string' || !uuidRegex.test(value)) {
    throw new UserInputError(`${name} must be a valid uuid`)
  }

  return value
}

export const validateTrackInput = (input) => {
  const {
    track_name,
    track_genre,
    popularity,
    duration_ms,
    tempo,
    danceability,
    energy,
    acousticness,
    instrumentalness,
    key,
    explicit
  } = input

  const validated = {}

  if (track_name !== undefined) {
    validated.track_name = assertString(track_name, 'track_name', 1, 100)
  }

  if (track_genre !== undefined) {
    validated.track_genre = assertString(track_genre, 'track_genre', 1, 50)
  }

  if (popularity !== undefined) {
    validated.popularity = assertNumber(popularity, 'popularity', 0, 100)
  }

  if (duration_ms !== undefined) {
    validated.duration_ms = assertNumber(duration_ms, 'duration_ms', 0)
  }

  if (tempo !== undefined) {
    validated.tempo = assertNumber(tempo, 'tempo', 0)
  }

  if (danceability !== undefined) {
    validated.danceability = assertNumber(danceability, 'danceability', 0, 1)
  }

  if (energy !== undefined) {
    validated.energy = assertNumber(energy, 'energy', 0, 1)
  }

  if (acousticness !== undefined) {
    validated.acousticness = assertNumber(acousticness, 'acousticness', 0, 1)
  }

  if (instrumentalness !== undefined) {
    validated.instrumentalness = assertNumber(instrumentalness, 'instrumentalness', 0, 1)
  }

  if (key !== undefined) {
    validated.key = assertNumber(key, 'key', 0, 11)
  }

  if (explicit !== undefined) {
    validated.explicit = assertBoolean(explicit, 'explicit')
  }

  return validated
}

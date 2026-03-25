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

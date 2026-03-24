/**
 * Middleware function for requiring authentication in GraphQL resolvers.
 */

import { AuthenticationError } from 'apollo-server-errors'

export function requireAuth (user) {
  if (!user) {
    throw new AuthenticationError('Unauthorized')
  }
}

/**
 * This module exports a utility function to be used in database query results.
 *
 */

import { ApolloError } from 'apollo-server-errors'

export const requireRow = (res, message = 'Resource not found') => {
  if (!res.rows[0]) {
    throw new ApolloError(message, 'NOT_FOUND')
  }
  return res.rows[0]
}

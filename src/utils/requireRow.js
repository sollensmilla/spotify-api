/**
 * This module exports a utility function to be used in database query results.
 *
 * @param res
 * @param message
 */
export const requireRow = (res, message = 'Resource not found') => {
  if (!res.rows[0]) {
    throw new Error(message)
  }
  return res.rows[0]
}

/**
 * Middleware function for authenticating incoming requests.
 */

import { verifyToken } from '../utils/jwt.js'

export const authenticate = (req) => {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) return null

  const token = authHeader.split(' ')[1]
  const decoded = verifyToken(token)

  if (!decoded) return null

  return {
    id: decoded.sub
  }
}

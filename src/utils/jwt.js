/**
 * Utility functions for generating and verifying JSON Web Tokens (JWTs) for user authentication.
 */

import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET

export const generateToken = (user) => {
  return jwt.sign(
    {
      sub: user.id,
    },
    SECRET,
    {
      expiresIn: '1h',
      algorithm: 'HS256'
    }
  )
}

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, SECRET, {
      algorithms: ['HS256']
    })
  } catch {
    return null
  }
}

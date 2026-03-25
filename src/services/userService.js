/**
 * Service class for handling user-related database operations.
 */

import bcrypt from 'bcrypt'
import { generateToken } from '../utils/jwt.js'
import {
  UserInputError,
  AuthenticationError,
  ApolloError
} from 'apollo-server-errors'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export class UserService {
  constructor (pool) {
    this.pool = pool
  }

  async register (email, password) {
    if (!email || !password) {
      throw new UserInputError('Email and password are required')
    }

    if (!EMAIL_REGEX.test(email)) {
      throw new UserInputError('Invalid email format')
    }

    if (password.length < 8 || password.length > 100) {
      throw new UserInputError('Password must be 8-100 characters')
    }

    try {
      const hashed = await bcrypt.hash(password, 12)

      const res = await this.pool.query(
        `INSERT INTO users(email, password)
       VALUES ($1,$2)
       RETURNING id,email`,
        [email, hashed]
      )

      const user = res.rows[0]

      return {
        token: generateToken({ id: user.id })
      }
    } catch (err) {
      if (err.code === '23505') {
        throw new UserInputError('User already exists')
      }
      console.error('Register error:', err)
      throw new ApolloError('Registration failed', 'INTERNAL_ERROR')
    }
  }

  async login (email, password) {
    if (!email || !password) {
      throw new UserInputError('Email and password are required')
    }

    const res = await this.pool.query(
      'SELECT * FROM users WHERE email=$1',
      [email]
    )

    const user = res.rows[0]

    const hash =
      user?.password ||
      '$2b$12$C6UzMDM.H6dfI/f/IKcEeO0u6U9QeZ7YdZrY4u9eXc9Yy9z0lW5eG' // fake hash

    const valid = await bcrypt.compare(password, hash)

    if (!user || !valid) {
      throw new AuthenticationError('Invalid credentials')
    }

    return {
      token: generateToken({ id: user.id })
    }
  }
}

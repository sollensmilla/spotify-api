/**
 * Service class for handling user-related database operations.
 */

import bcrypt from 'bcrypt'
import { generateToken } from '../utils/jwt.js'

export class UserService {
  constructor (pool) {
    this.pool = pool
  }

  async register (email, password) {
    if (!email || email.trim() === '' || !password || password.trim() === '') {
      throw new Error('Email and password are required')
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters')
    }

    try {
      const hashed = await bcrypt.hash(password, 10)

      const res = await this.pool.query(
                `INSERT INTO users(email, password)
       VALUES ($1,$2)
       RETURNING id,email`,
                [email, hashed]
      )

      const user = res.rows[0]

      return {
        token: generateToken(user)
      }
    } catch (err) {
      if (err.code === '23505') {
        throw new Error('User already exists')
      }

      throw new Error('Registration failed')
    }
  }

  async login (email, password) {
    if (!email || !password) {
      throw new Error('Email and password are required')
    }

    const res = await this.pool.query(
      'SELECT * FROM users WHERE email=$1',
      [email]
    )

    const user = res.rows[0]

    if (!user) {
      throw new Error('Invalid credentials')
    }

    const valid = await bcrypt.compare(password, user.password)

    if (!valid) {
      throw new Error('Invalid credentials')
    }

    return {
      token: generateToken(user)
    }
  }
}

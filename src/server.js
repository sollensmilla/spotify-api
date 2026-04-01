import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectGraphQL } from './config/connectGraphQL.js'
import { connectDB } from './config/connectDB.js'
import { securityMiddleware } from './config/rateLimit.js'
import { helmetMiddleware } from './config/helmet.js'

if (!process.env.RAILWAY_ENVIRONMENT) {
  dotenv.config()
}

const app = express()
app.use(cors())
helmetMiddleware(app)
app.use(express.json())

securityMiddleware(app)

async function startServer () {
  try {
    await connectDB()

    await connectGraphQL(app)

    const PORT = process.env.PORT || 4000

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}/graphql`)
    })
  } catch (err) {
    console.error('Server startup error:', err)
  }
}

startServer()

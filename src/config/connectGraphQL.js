import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import {
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginLandingPageProductionDefault
} from '@apollo/server/plugin/landingPage/default'

import { resolvers } from '../graphql/resolver.js'
import { typeDefs } from '../graphql/schema.js'

import { pool } from './connectDB.js'
import { createContext } from '../context/createContext.js'

export const connectGraphQL = async (app) => {
  const isDev = process.env.NODE_ENV !== 'production'

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [
      isDev
        ? ApolloServerPluginLandingPageLocalDefault({ embed: true })
        : ApolloServerPluginLandingPageProductionDefault({ embed: false })
    ]
  })

  await server.start()

  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => createContext({ req, pool })
    })
  )

  return server
}

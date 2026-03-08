import { ApolloServer } from "apollo-server-express";

export const connectGraphQL = async (app) => {

    const typeDefs = `#graphql
    type Query {
      hello: String
    }
  `;

    const resolvers = {
        Query: {
            hello: () => "Spotify API is running 🚀"
        }
    };

    const server = new ApolloServer({ typeDefs, resolvers });

    await server.start();
    server.applyMiddleware({ app });

    return server;
};
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";

import { resolvers } from "../graphql/resolver.js";
import { typeDefs } from "../graphql/schema.js";

import { pool } from "./connectDB.js";
import { createContext } from "../context/createContext.js";

export const connectGraphQL = async (app) => {

    const server = new ApolloServer({
        typeDefs,
        resolvers
    });

    await server.start();

    app.use(
        "/graphql",
        expressMiddleware(server, {
            context: async () => createContext(pool)
        })
    );

    return server;
};
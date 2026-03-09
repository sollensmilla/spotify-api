import { ApolloServer } from "apollo-server-express";

import { typeDefs } from "../graphql/schema.js";
import { resolvers } from "../graphql/resolver.js";
import { trackArtistsLoader } from "../graphql/track/track.loader.js";
import { albumLoader } from "../graphql/album/album.loader.js";
import { artistLoader } from "../graphql/artist/artist.loader.js";

export const connectGraphQL = async (app) => {

    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context: () => ({
            loaders: {
                trackArtistsLoader,
                albumLoader,
                artistLoader
            }
        })
    });

    await server.start();

    server.applyMiddleware({
        app,
        path: "/graphql"
    });

    return server;
};
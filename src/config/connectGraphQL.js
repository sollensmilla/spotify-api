import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";

import { resolvers } from "../graphql/resolver.js";
import { typeDefs } from "../graphql/schema.js";

import { pool } from "./connectDB.js";

import { TrackService } from "../services/trackService.js";
import { AlbumService } from "../services/albumService.js";
import { ArtistService } from "../services/artistService.js";

import { createTrackArtistsLoader } from "../graphql/track/track.loader.js";
import { createAlbumLoader } from "../graphql/album/album.loader.js";
import { createArtistLoader } from "../graphql/artist/artist.loader.js";

export const connectGraphQL = async (app) => {

    const server = new ApolloServer({
        typeDefs,
        resolvers
    });

    await server.start();

    app.use(
        "/graphql",
        expressMiddleware(server, {

            context: async () => {

                const services = {
                    trackService: new TrackService(pool),
                    albumService: new AlbumService(pool),
                    artistService: new ArtistService(pool)
                };

                const loaders = {
                    albumLoader: createAlbumLoader(pool),
                    artistLoader: createArtistLoader(pool),
                    trackArtistsLoader: createTrackArtistsLoader(pool)
                };

                return {
                    services,
                    loaders
                };
            }

        })
    );

    return server;
};
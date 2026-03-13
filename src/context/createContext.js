import { TrackService } from "../services/trackService.js";
import { AlbumService } from "../services/albumService.js";
import { ArtistService } from "../services/artistService.js";

import { createTrackArtistsLoader } from "../graphql/track/track.loader.js";
import { createAlbumLoader } from "../graphql/album/album.loader.js";
import { createArtistLoader } from "../graphql/artist/artist.loader.js";

import { authenticate } from "../middleware/authenticate.js";

export const createContext = (pool) => {

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

    const user = authenticate(req);

    return {
        services,
        loaders,
        user
    };
};
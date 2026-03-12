import DataLoader from "dataloader";

export const createArtistLoader = (pool) =>
    new DataLoader(async (artistIds) => {

        const res = await pool.query(
            "SELECT * FROM artists WHERE id = ANY($1)",
            [artistIds]
        );

        const map = {};
        res.rows.forEach(a => map[a.id] = a);

        return artistIds.map(id => map[id] || null);
    });
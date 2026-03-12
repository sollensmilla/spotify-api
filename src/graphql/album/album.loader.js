import DataLoader from "dataloader";

export const createAlbumLoader = (pool) =>
    new DataLoader(async (albumIds) => {

        const res = await pool.query(
            "SELECT * FROM albums WHERE id = ANY($1)",
            [albumIds]
        );

        const map = {};
        res.rows.forEach(a => map[a.id] = a);

        return albumIds.map(id => map[id] || null);
    });
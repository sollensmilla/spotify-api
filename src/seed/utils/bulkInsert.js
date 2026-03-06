export async function bulkInsert(pool, table, columns, rows) {

    if (!rows.length) return;

    const BATCH_SIZE = 1000;

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {

        const batch = rows.slice(i, i + BATCH_SIZE);

        const values = [];
        const placeholders = [];

        batch.forEach((row, rowIndex) => {
            const rowPlaceholders = [];

            columns.forEach((col, colIndex) => {
                values.push(row[col] ?? null);
                rowPlaceholders.push(`$${rowIndex * columns.length + colIndex + 1}`);
            });

            placeholders.push(`(${rowPlaceholders.join(",")})`);
        });

        const query = `
            INSERT INTO ${table} (${columns.join(",")})
            VALUES ${placeholders.join(",")}
        `;

        await pool.query(query, values);
    }
}
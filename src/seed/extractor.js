import fs from "fs";
import csv from "csv-parser";

export function extractCSV(path) {
    return new Promise((resolve, reject) => {
        const rows = [];

        fs.createReadStream(path)
            .pipe(csv())
            .on("data", (row) => rows.push(row))
            .on("end", () => resolve(rows))
            .on("error", reject);
    });
}
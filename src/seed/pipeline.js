/** 
 * This module defines the main pipeline for seeding the PostgreSQL database. It orchestrates the extraction, transformation, clearing, and loading into the database.
*/

import { extractCSV } from "./extractor.js";
import { transformData } from "./transformer.js";
import { clearTables, loadData } from "./loader.js";

export async function runPipeline(csvPath) {

    console.log("Extracting CSV...");
    const rows = await extractCSV(csvPath);

    console.log("Transforming data...");
    const data = transformData(rows);

    console.log("Clearing tables...");
    await clearTables();

    console.log("Loading database...");
    await loadData(data);

    console.log("Seed complete!");
}
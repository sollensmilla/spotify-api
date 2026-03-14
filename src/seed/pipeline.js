/** 
 * This module defines the main pipeline for seeding the PostgreSQL database. It orchestrates the extraction, transformation, clearing, and loading into the database.
*/

import { pool } from "../config/connectDB.js";
import { extractCSV } from "./extractor.js";
import { transformData } from "./transformer.js";
import { createTables, clearTables, loadData } from "./loader.js";

export async function runPipeline(csvPath) {

    console.log("Extracting CSV...");
    const rows = await extractCSV(csvPath);

    console.log("Transforming data...");
    const data = transformData(rows);

    console.log("Creating table for users...");
    await createTables(pool);

    console.log("Clearing tables...");
    await clearTables(pool);

    console.log("Loading database...");
    await loadData(pool, data);

    console.log("Seed complete!");
}
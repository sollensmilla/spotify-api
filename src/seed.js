/** 
 * This is the main entry point for seeding the PostgreSQL database with data from the Spotify dataset.
*/

import { runPipeline } from "./seed/pipeline.js";

runPipeline("./data/spotify_dataset.csv")
  .then(() => {
    console.log("Done");
    process.exit();
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
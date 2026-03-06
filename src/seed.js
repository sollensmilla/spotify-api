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
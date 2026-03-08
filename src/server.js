import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectGraphQL } from "./config/connectGraphQL.js";
import { connectDB } from "./config/connectDB.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

async function startServer() {

  await connectDB();

  const server = await connectGraphQL(app);

  const PORT = process.env.PORT || 4000;

  app.listen(PORT, () =>
    console.log(
      `Server running on http://localhost:${PORT}${server.graphqlPath}`
    )
  );
}

startServer();
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ApolloServer } from "apollo-server-express";
import { connectDB } from "./config/mongo.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const typeDefs = `#graphql
    type Query {
        hello: String
        }
`;  

const resolvers = {
    Query: {
        hello: () => 'Spotify API is running 🚀'
    }
};

async function startServer() {
  await connectDB(process.env.MONGO_URI);

  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  server.applyMiddleware({ app });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () =>
    console.log(`Server is running on http://localhost:${PORT}${server.graphqlPath}`)
  );
}

startServer();
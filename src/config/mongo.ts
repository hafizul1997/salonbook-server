
import "dotenv/config";

import { MongoClient } from "mongodb";

const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  throw new Error("MONGODB_URI is missing in environment variables");
}

const client = new MongoClient(mongoURI);

export const mongoDb = client.db();

export const connectMongoClient = async (): Promise<void> => {
  await client.connect();
  console.log("Better Auth MongoDB client connected");
};

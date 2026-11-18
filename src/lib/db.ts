import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is missing!");
}

const client = new MongoClient(uri);

const dbName = process.env.DB_NAME;

if (!dbName) {
  throw new Error("DB_NAME is missing!");
}

const db = client.db(dbName);

export { client, db };

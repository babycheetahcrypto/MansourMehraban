// lib/db.ts
import { MongoClient } from 'mongodb';

if (!process.env.DATABASE_URL) {
  throw new Error('Please add your MongoDB URI to .env');
}

const url = process.env.DATABASE_URL;
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(url);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(url);
  clientPromise = client.connect();
}

export default clientPromise;

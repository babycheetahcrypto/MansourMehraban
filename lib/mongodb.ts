// lib/mongodb.ts
import { MongoClient } from 'mongodb';

if (!process.env.DATABASE_URL) {
  throw new Error('Invalid/Missing environment variable: "DATABASE_URL"');
}

const url = process.env.DATABASE_URL;
const options = {}; // Add your connection options here if needed

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

async function connectToDatabase() {
  try {
    client = new MongoClient(url, options);
    await client.connect();
    console.log('Connected to MongoDB successfully!');
    return client;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw new Error(`Unable to connect to MongoDB at URL: ${url}`);
  }
}

export default clientPromise = connectToDatabase();

import { MongoClient } from 'mongodb';

if (!process.env.DATABASE_URL) {
  throw new Error('Invalid/Missing environment variable: "DATABASE_URL"');
}

const url = process.env.DATABASE_URL;
const options = {};

let client;
let clientPromise: Promise<MongoClient>;

try {
  client = new MongoClient(url, options);
  clientPromise = client.connect();
} catch (error) {
  console.error('Failed to connect to MongoDB:', error);
  throw new Error('Unable to connect to MongoDB');
}

export default clientPromise;

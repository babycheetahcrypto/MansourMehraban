// mongodb.ts (Revised)
import { MongoClient } from 'mongodb';

if (!process.env.DATABASE_URL) {
  throw new Error('Invalid/Missing environment variable: "DATABASE_URL"');
}

const url = process.env.DATABASE_URL;
const options = {}; // Add your connection options here if needed

let client;
let clientPromise: Promise<MongoClient>;

async function connectToDatabase() {
  try {
    client = new MongoClient(url, options);
    await client.connect(); // Connect within the try block
    console.log('Connected to MongoDB successfully!');
    return client;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw new Error(`Unable to connect to MongoDB at URL: ${url}`); // More specific error message
  }
}

export default clientPromise = connectToDatabase(); // Initialize clientPromise

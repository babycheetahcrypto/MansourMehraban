import { MongoClient } from 'mongodb';

if (!process.env.DATABASE_URL) {
  throw new Error('Please add your DATABASE_URL to .env.local');
}

const url = process.env.DATABASE_URL;
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(url, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(url, options);
  clientPromise = client.connect();
}

export default clientPromise;

export async function testMongoConnection() {
  try {
    const client = await clientPromise;
    await client.db().command({ ping: 1 });
    console.log('Successfully connected to MongoDB');
    await client.close();
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

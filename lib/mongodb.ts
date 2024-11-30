import { MongoClient } from 'mongodb';

if (!process.env.DATABASE_URL) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

const uri = process.env.DATABASE_URL;
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

try {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
  // Verify connection
  clientPromise
    .then(() => {
      console.log('Successfully connected to MongoDB.');
    })
    .catch((error) => {
      console.error('MongoDB connection error:', error);
    });
} catch (error) {
  console.error('Failed to connect to MongoDB:', error);
  throw new Error('Unable to connect to MongoDB.');
}

export default clientPromise;

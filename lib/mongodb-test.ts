import { MongoClient } from 'mongodb';

export async function testMongoDBConnection() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MongoDB URI is not defined');
    }

    const client = new MongoClient(uri);
    await client.connect();
    await client.db().command({ ping: 1 });
    await client.close();
    console.log('MongoDB connection successful');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
}

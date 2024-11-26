import { MongoClient } from 'mongodb';

export async function testMongoDBConnection() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MongoDB URI is not defined');
    }

    // Validate MongoDB URI format
    if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
      throw new Error('Invalid MongoDB URI format');
    }

    const client = new MongoClient(uri, {
      connectTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 10000,
    });

    await client.connect();
    await client.db().command({ ping: 1 });
    console.log('MongoDB connection successful');
    await client.close();
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
}

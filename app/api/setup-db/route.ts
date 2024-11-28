import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('cryptoGame');

    // Create indexes
    await db.collection('users').createIndex({ telegramId: 1 }, { unique: true });
    await db.collection('users').createIndex({ coins: -1 }); // For leaderboard

    return NextResponse.json({ message: 'Database setup completed successfully' });
  } catch (error) {
    console.error('Error setting up database:', error);
    return NextResponse.json({ error: 'Failed to set up database' }, { status: 500 });
  }
}

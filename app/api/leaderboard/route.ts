import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db('cryptoGame');
    const leaderboard = await db
      .collection('users')
      .find({}, { projection: { telegramId: 1, name: 1, coins: 1, profitPerHour: 1 } })
      .sort({ coins: -1 })
      .limit(200)
      .toArray();

    const leaderboardWithRanks = leaderboard.map((user, index) => ({
      ...user,
      rank: index + 1,
    }));

    return NextResponse.json(leaderboardWithRanks);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

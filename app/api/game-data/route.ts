// app/api/game-data/route.ts
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const telegramId = searchParams.get('telegramId');

  if (!telegramId) {
    return NextResponse.json({ error: 'Telegram ID is required' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db('babycheetah');
    const gameData = await db.collection('gameData').findOne({
      telegramId: parseInt(telegramId),
    });

    if (!gameData) {
      // Return default game data for new users
      return NextResponse.json({
        telegramId: parseInt(telegramId),
        coins: 0,
        level: 1,
        exp: 0,
        profitPerHour: 0,
        shopItems: [],
        premiumShopItems: [],
        tasks: [],
        dailyReward: null,
        unlockedLevels: [],
        clickPower: 1,
        friendsCoins: 0,
        energy: 100,
        pphAccumulated: 0,
        multiplier: 1,
        multiplierEndTime: null,
        boosterCooldown: null,
        selectedCoinImage: 'default',
        settings: {},
      });
    }

    return NextResponse.json(gameData);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { telegramId, ...gameData } = body;

    if (!telegramId) {
      return NextResponse.json({ error: 'Telegram ID is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('babycheetah');

    const result = await db.collection('gameData').updateOne(
      { telegramId: parseInt(telegramId) },
      {
        $set: {
          ...gameData,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    const updatedGameData = await db.collection('gameData').findOne({
      telegramId: parseInt(telegramId),
    });

    return NextResponse.json(updatedGameData);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

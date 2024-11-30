import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/db';

export async function GET(request: NextRequest) {
  console.log('Fetching game data...');
  const searchParams = request.nextUrl.searchParams;
  const telegramId = searchParams.get('telegramId');

  if (!telegramId) {
    return NextResponse.json({ error: 'Telegram ID is required' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db('babycheetah');
    console.log('Looking for user with telegramId:', telegramId);

    const gameData = await db.collection('gameData').findOne({
      telegramId: parseInt(telegramId),
    });

    console.log('Found game data:', gameData);

    if (!gameData) {
      // Create default game data for new users
      const defaultGameData = {
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
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db.collection('gameData').insertOne(defaultGameData);
      return NextResponse.json(defaultGameData);
    }

    return NextResponse.json(gameData);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch game data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { telegramId, ...gameData } = body;

    if (!telegramId) {
      return NextResponse.json({ error: 'Telegram ID is required' }, { status: 400 });
    }

    console.log('Updating game data for telegramId:', telegramId);

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

    console.log('Update result:', result);

    const updatedGameData = await db.collection('gameData').findOne({
      telegramId: parseInt(telegramId),
    });

    return NextResponse.json(updatedGameData);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to update game data' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const telegramId = searchParams.get('telegramId');

  if (!telegramId) {
    return NextResponse.json({ error: 'Telegram ID is required' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        telegramId: telegramId,
      },
      include: {
        shopItems: true,
        premiumShopItems: true,
        tasks: true,
        dailyReward: true,
        trophies: true,
        referralRewards: true,
      },
    });

    if (!user) {
      console.log(`User not found for telegramId: ${telegramId}`);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('User found:', user);
    return NextResponse.json(user);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { telegramId, username, firstName, lastName, profilePhoto } = body;

  if (!telegramId) {
    return NextResponse.json({ error: 'Telegram ID is required' }, { status: 400 });
  }

  console.log('Creating new user with data:', body);

  try {
    const user = await prisma.user.create({
      data: {
        telegramId,
        username,
        firstName,
        lastName,
        profilePhoto,
        coins: 0,
        level: 1,
        exp: 0,
        unlockedLevels: [1],
        clickPower: 1,
        friendsCoins: {},
        energy: 1000,
        pphAccumulated: 0,
        multiplier: 1,
        settings: { vibration: true, backgroundMusic: false },
        profitPerHour: 0,
        invitedFriends: [],
        dailyReward: {
          create: {
            lastClaimed: null,
            streak: 0,
            day: 1,
            completed: false,
          },
        },
      },
      include: {
        shopItems: true,
        premiumShopItems: true,
        tasks: true,
        dailyReward: true,
        trophies: true,
        referralRewards: true,
      },
    });

    console.log('User created:', user);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { telegramId, ...updateData } = body;

  if (!telegramId) {
    return NextResponse.json({ error: 'Telegram ID is required' }, { status: 400 });
  }

  console.log('Updating user with data:', updateData);

  try {
    const user = await prisma.user.update({
      where: { telegramId },
      data: updateData,
      include: {
        shopItems: true,
        premiumShopItems: true,
        tasks: true,
        dailyReward: true,
        trophies: true,
        referralRewards: true,
      },
    });

    console.log('User updated:', user);
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

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

  try {
    const user = await prisma.user.create({
      data: {
        telegramId,
        username,
        firstName,
        lastName,
        profilePhoto,
        name: `${firstName} ${lastName || ''}`.trim(),
        coins: 0,
        level: 1,
        exp: 0,
        unlockedLevels: [1],
        clickPower: 1,
        friendsCoins: {},
        energy: 500,
        pphAccumulated: 0,
        multiplier: 1,
        settings: { vibration: true, backgroundMusic: false, soundEffect: true },
        profitPerHour: 0,
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
      },
    });

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

  try {
    const user = await prisma.user.update({
      where: { telegramId },
      data: updateData,
      include: {
        shopItems: true,
        premiumShopItems: true,
        tasks: true,
        dailyReward: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

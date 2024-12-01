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
      where: { telegramId: parseInt(telegramId) },
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
  try {
    const body = await request.json();
    const {
      telegramId,
      username,
      coins,
      level,
      exp,
      profitPerHour,
      shopItems,
      premiumShopItems,
      tasks,
      dailyReward,
      unlockedLevels,
      clickPower,
      friendsCoins,
      energy,
      pphAccumulated,
      multiplier,
      multiplierEndTime,
      boosterCooldown,
      selectedCoinImage,
      settings,
    } = body;

    if (!telegramId) {
      return NextResponse.json({ error: 'Telegram ID is required' }, { status: 400 });
    }

    const result = await prisma.user.upsert({
      where: { telegramId: parseInt(telegramId) },
      update: {
        username,
        coins,
        level,
        exp,
        profitPerHour,
        shopItems: {
          set: shopItems,
        },
        premiumShopItems: {
          set: premiumShopItems,
        },
        tasks: {
          set: tasks,
        },
        dailyReward: {
          upsert: {
            create: dailyReward,
            update: dailyReward,
          },
        },
        unlockedLevels,
        clickPower,
        friendsCoins,
        energy,
        pphAccumulated,
        multiplier,
        multiplierEndTime,
        boosterCooldown,
        selectedCoinImage,
        settings,
      },
      create: {
        telegramId: parseInt(telegramId),
        username,
        coins,
        level,
        exp,
        profitPerHour,
        shopItems: {
          create: shopItems,
        },
        premiumShopItems: {
          create: premiumShopItems,
        },
        tasks: {
          create: tasks,
        },
        dailyReward: {
          create: dailyReward,
        },
        unlockedLevels,
        clickPower,
        friendsCoins,
        energy,
        pphAccumulated,
        multiplier,
        multiplierEndTime,
        boosterCooldown,
        selectedCoinImage,
        settings,
      },
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const telegramId = searchParams.get('telegramId');

    if (!telegramId) {
      return NextResponse.json({ error: 'Telegram ID is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: {
        telegramId: parseInt(telegramId),
      },
      include: {
        shopItems: true,
        premiumShopItems: true,
        tasks: true,
        dailyReward: true,
      },
    });

    if (!user) {
      const newUser = await prisma.user.create({
        data: {
          telegramId: parseInt(telegramId),
          username: '',
          coins: 0,
          level: 1,
          exp: 0,
          energy: 500,
          clickPower: 1,
          profitPerHour: 0,
          pphAccumulated: 0,
          multiplier: 1,
          unlockedLevels: [1],
          settings: {
            vibration: true,
            backgroundMusic: true,
            soundEffect: true,
          },

          dailyReward: {
            create: {
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
      return NextResponse.json(newUser);
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
    const { telegramId, ...updateData } = body;

    if (!telegramId) {
      return NextResponse.json({ error: 'Telegram ID is required' }, { status: 400 });
    }

    const updatedUser = await prisma.user.upsert({
      where: {
        telegramId: parseInt(telegramId),
      },
      update: {
        ...updateData,
        lastActive: new Date(),
        coins: typeof updateData.coins === 'number' ? updateData.coins : undefined,
        level: typeof updateData.level === 'number' ? updateData.level : undefined,
        exp: typeof updateData.exp === 'number' ? updateData.exp : undefined,
        energy: typeof updateData.energy === 'number' ? updateData.energy : undefined,
        clickPower: typeof updateData.clickPower === 'number' ? updateData.clickPower : undefined,
        profitPerHour:
          typeof updateData.profitPerHour === 'number' ? updateData.profitPerHour : undefined,
        pphAccumulated:
          typeof updateData.pphAccumulated === 'number' ? updateData.pphAccumulated : undefined,
        multiplier: typeof updateData.multiplier === 'number' ? updateData.multiplier : undefined,
        totalClicks:
          typeof updateData.totalClicks === 'number' ? updateData.totalClicks : undefined,
        rank: typeof updateData.rank === 'number' ? updateData.rank : undefined,

        unlockedLevels: Array.isArray(updateData.unlockedLevels)
          ? updateData.unlockedLevels
          : undefined,
        multiplierEndTime: updateData.multiplierEndTime
          ? new Date(updateData.multiplierEndTime)
          : undefined,
        boosterCooldown: updateData.boosterCooldown
          ? new Date(updateData.boosterCooldown)
          : undefined,

        friendsCoins: updateData.friendsCoins || undefined,
        settings: updateData.settings || undefined,

        shopItems: updateData.shopItems
          ? {
              deleteMany: {},
              create: updateData.shopItems,
            }
          : undefined,

        premiumShopItems: updateData.premiumShopItems
          ? {
              deleteMany: {},
              create: updateData.premiumShopItems,
            }
          : undefined,

        tasks: updateData.tasks
          ? {
              deleteMany: {},
              create: updateData.tasks,
            }
          : undefined,

        dailyReward: updateData.dailyReward
          ? {
              upsert: {
                create: updateData.dailyReward,
                update: updateData.dailyReward,
              },
            }
          : undefined,
      },
      create: {
        telegramId: parseInt(telegramId),
        username: updateData.username || '',
        firstName: updateData.firstName,
        lastName: updateData.lastName,
        coins: 0,
        level: 1,
        exp: 0,
        energy: 500,
        clickPower: 1,
        profitPerHour: 0,
        pphAccumulated: 0,
        multiplier: 1,
        unlockedLevels: [1],
        settings: {
          vibration: true,
          backgroundMusic: true,
          soundEffect: true,
        },
      },
      include: {
        shopItems: true,
        premiumShopItems: true,
        tasks: true,
        dailyReward: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const telegramId = searchParams.get('telegramId');

    if (!telegramId) {
      return NextResponse.json({ error: 'Telegram ID is required' }, { status: 400 });
    }

    const parsedTelegramId = parseInt(telegramId);

    // First check if user exists
    const existingUser = await prisma.user.findUnique({
      where: {
        telegramId: parsedTelegramId,
      },
      include: {
        shopItems: true,
        premiumShopItems: true,
        tasks: true,
        trophies: true,
        dailyReward: true,
        referralRewards: true,
      },
    });

    if (existingUser) {
      return NextResponse.json(existingUser);
    }

    // If user doesn't exist, create a new one with all required fields
    const newUser = await prisma.user.create({
      data: {
        telegramId: parsedTelegramId,
        username: '',
        firstName: '',
        lastName: '',
        coins: 0,
        level: 1,
        exp: 0,
        energy: 500,
        clickPower: 1,
        profitPerHour: 0,
        pphAccumulated: 0,
        multiplier: 1,
        unlockedLevels: [1],
        totalEarnings: 0,
        totalClicks: 0,
        settings: {
          vibration: true,
          backgroundMusic: true,
          soundEffect: true,
        },
        // Create initial task
        tasks: {
          create: {
            type: 'daily',
            description: 'Click 100 times',
            maxProgress: 100,
            reward: 1000,
            completed: false,
            claimed: false,
            progress: 0,
          },
        },
        // Create daily reward
        dailyReward: {
          create: {
            streak: 0,
            day: 1,
            completed: false,
          },
        },
      },
    });

    // Fetch the created user with all relations
    const createdUserWithRelations = await prisma.user.findUnique({
      where: {
        id: newUser.id,
      },
      include: {
        shopItems: true,
        premiumShopItems: true,
        tasks: true,
        trophies: true,
        dailyReward: true,
        referralRewards: true,
      },
    });

    return NextResponse.json(createdUserWithRelations);
  } catch (error) {
    console.error('Error in GET:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { telegramId, ...updateData } = body;

    if (!telegramId) {
      return NextResponse.json({ error: 'Telegram ID is required' }, { status: 400 });
    }

    const parsedTelegramId = parseInt(telegramId);

    // First check if user exists
    const existingUser = await prisma.user.findUnique({
      where: {
        telegramId: parsedTelegramId,
      },
    });

    if (existingUser) {
      // Update existing user
      const updatedUser = await prisma.user.update({
        where: {
          telegramId: parsedTelegramId,
        },
        data: {
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
          totalEarnings:
            typeof updateData.totalEarnings === 'number' ? updateData.totalEarnings : undefined,
          unlockedLevels: Array.isArray(updateData.unlockedLevels)
            ? updateData.unlockedLevels
            : undefined,
          settings: updateData.settings || undefined,
        },
        include: {
          shopItems: true,
          premiumShopItems: true,
          tasks: true,
          trophies: true,
          dailyReward: true,
          referralRewards: true,
        },
      });
      return NextResponse.json(updatedUser);
    }

    // Create new user if doesn't exist
    const newUser = await prisma.user.create({
      data: {
        telegramId: parsedTelegramId,
        username: updateData.username || '',
        firstName: updateData.firstName || '',
        lastName: updateData.lastName || '',
        coins: 0,
        level: 1,
        exp: 0,
        energy: 500,
        clickPower: 1,
        profitPerHour: 0,
        pphAccumulated: 0,
        multiplier: 1,
        unlockedLevels: [1],
        totalEarnings: 0,
        totalClicks: 0,
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
        trophies: true,
        dailyReward: true,
        referralRewards: true,
      },
    });

    return NextResponse.json(newUser);
  } catch (error) {
    console.error('Error in POST:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

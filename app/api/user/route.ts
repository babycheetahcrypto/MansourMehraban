import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const telegramId = searchParams.get('telegramId');

    if (!telegramId) {
      return NextResponse.json({ error: 'Telegram ID is required' }, { status: 400 });
    }

    // Test database connection
    try {
      await prisma.$connect();
      console.log('Database connection successful');
    } catch (connError) {
      console.error('Database connection failed:', connError);
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const parsedTelegramId = parseInt(telegramId);

    // First try to find the user
    try {
      const existingUser = await prisma.user.findUnique({
        where: {
          telegramId: parsedTelegramId,
        },
      });

      if (existingUser) {
        const userWithRelations = await prisma.user.findUnique({
          where: { telegramId: parsedTelegramId },
          include: {
            shopItems: true,
            premiumShopItems: true,
            tasks: true,
            trophies: true,
            dailyReward: true,
            referralRewards: true,
          },
        });
        return NextResponse.json(userWithRelations);
      }

      // If user doesn't exist, create new user
      const newUser = await prisma.user.create({
        data: {
          telegramId: parsedTelegramId,
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
          totalEarnings: 0,
          totalClicks: 0,
          settings: {
            vibration: true,
            backgroundMusic: true,
            soundEffect: true,
          },
        },
      });

      // After creating the base user, create related records
      if (newUser) {
        // Create initial task
        await prisma.task.create({
          data: {
            userId: newUser.id,
            type: 'daily',
            description: 'Click 100 times',
            maxProgress: 100,
            reward: 1000,
            completed: false,
            claimed: false,
            progress: 0,
          },
        });

        // Create daily reward
        await prisma.dailyReward.create({
          data: {
            userId: newUser.id,
            streak: 0,
            day: 1,
            completed: false,
          },
        });

        // Return user with all relations
        const createdUserWithRelations = await prisma.user.findUnique({
          where: { telegramId: parsedTelegramId },
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
      }
    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      return NextResponse.json(
        {
          error: 'Database operation failed',
          details: dbError instanceof Error ? dbError.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { telegramId, ...updateData } = body;

    if (!telegramId) {
      return NextResponse.json({ error: 'Telegram ID is required' }, { status: 400 });
    }

    // Test database connection
    try {
      await prisma.$connect();
      console.log('Database connection successful');
    } catch (connError) {
      console.error('Database connection failed:', connError);
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const parsedTelegramId = parseInt(telegramId);

    const updatedUser = await prisma.user.upsert({
      where: {
        telegramId: parsedTelegramId,
      },
      update: {
        lastActive: new Date(),
        ...updateData,
      },
      create: {
        telegramId: parsedTelegramId,
        username: updateData.username || '',
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

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error in POST:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

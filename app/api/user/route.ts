import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const telegramId = searchParams.get('telegramId');

    if (!telegramId) {
      console.error('Telegram ID is missing');
      return NextResponse.json({ error: 'Telegram ID is required' }, { status: 400 });
    }

    console.log('Searching for user with telegramId:', telegramId);

    const user = await prisma.user.findUnique({
      where: {
        telegramId: parseInt(telegramId),
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

    if (!user) {
      console.log('Creating new user for telegramId:', telegramId);
      try {
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
            totalEarnings: 0,
            totalClicks: 0,
            settings: {
              vibration: true,
              backgroundMusic: true,
              soundEffect: true,
            },
            tasks: {
              create: [
                {
                  type: 'daily',
                  description: 'Click 100 times',
                  maxProgress: 100,
                  reward: 1000,
                  completed: false,
                  claimed: false,
                  progress: 0,
                },
              ],
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
            trophies: true,
            dailyReward: true,
            referralRewards: true,
          },
        });
        console.log('New user created successfully:', newUser.id);
        return NextResponse.json(newUser);
      } catch (error) {
        const prismaError = error as Prisma.PrismaClientKnownRequestError;
        console.error('Error creating new user:', prismaError.message);
        return NextResponse.json(
          { error: 'Failed to create new user', details: prismaError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(user);
  } catch (error) {
    const prismaError = error as Prisma.PrismaClientKnownRequestError;
    console.error('Main try-catch error:', prismaError.message);
    return NextResponse.json(
      { error: 'Internal server error', details: prismaError.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { telegramId, ...updateData } = body;

    if (!telegramId) {
      console.error('Telegram ID is missing in POST request');
      return NextResponse.json({ error: 'Telegram ID is required' }, { status: 400 });
    }

    console.log('Updating user with telegramId:', telegramId);

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
        totalEarnings:
          typeof updateData.totalEarnings === 'number' ? updateData.totalEarnings : undefined,
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

        trophies: updateData.trophies
          ? {
              deleteMany: {},
              create: updateData.trophies,
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

        referralRewards: updateData.referralRewards
          ? {
              create: updateData.referralRewards,
            }
          : undefined,
      },
      create: {
        telegramId: parseInt(telegramId),
        username: updateData.username || '',
        firstName: updateData.firstName,
        lastName: updateData.lastName,
        profilePhoto: updateData.profilePhoto,
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
    const prismaError = error as Prisma.PrismaClientKnownRequestError;
    console.error('POST request error:', prismaError.message);
    return NextResponse.json(
      { error: 'Internal server error', details: prismaError.message },
      { status: 500 }
    );
  }
}

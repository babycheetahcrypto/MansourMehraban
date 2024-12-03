import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const telegramId = searchParams.get('telegramId');

  if (!telegramId) {
    return NextResponse.json({ error: 'Telegram ID is required' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        telegramId: parseInt(telegramId),
      },
      include: {
        shopItems: true,
        premiumShopItems: true,
        tasks: true,
        dailyReward: true,
        trophies: true,
        referralRewards: true,
        sentInvites: true,
        receivedInvites: true,
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
    const { telegramId, username, firstName, lastName, coins, level, exp } = body;

    if (!telegramId) {
      return NextResponse.json({ error: 'Telegram ID is required' }, { status: 400 });
    }

    const user = await prisma.user.upsert({
      where: {
        telegramId: parseInt(telegramId),
      },
      update: {
        username,
        firstName,
        lastName,
        coins: coins !== undefined ? coins : undefined,
        level: level !== undefined ? level : undefined,
        exp: exp !== undefined ? exp : undefined,
        updatedAt: new Date(),
      },
      create: {
        telegramId: parseInt(telegramId),
        username,
        firstName,
        lastName,
        coins: coins || 0,
        level: level || 1,
        exp: exp || 0,
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

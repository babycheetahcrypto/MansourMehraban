import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const telegramId = searchParams.get('telegramId');

    if (!telegramId) {
      return NextResponse.json({ error: 'Telegram ID is required' }, { status: 400 });
    }

    // Add validation for telegramId format
    const parsedTelegramId = parseInt(telegramId);
    if (isNaN(parsedTelegramId)) {
      return NextResponse.json({ error: 'Invalid Telegram ID format' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { telegramId: parsedTelegramId },
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
    const { telegramId } = body;

    if (!telegramId) {
      return NextResponse.json({ error: 'Telegram ID is required' }, { status: 400 });
    }

    // Add validation for telegramId format
    const parsedTelegramId = parseInt(telegramId);
    if (isNaN(parsedTelegramId)) {
      return NextResponse.json({ error: 'Invalid Telegram ID format' }, { status: 400 });
    }

    const result = await prisma.user.upsert({
      where: { telegramId: parsedTelegramId },
      update: {
        ...body,
        shopItems: body.shopItems ? { set: body.shopItems } : undefined,
        premiumShopItems: body.premiumShopItems ? { set: body.premiumShopItems } : undefined,
        tasks: body.tasks ? { set: body.tasks } : undefined,
        dailyReward: body.dailyReward
          ? {
              upsert: {
                create: body.dailyReward,
                update: body.dailyReward,
              },
            }
          : undefined,
      },
      create: {
        telegramId: parsedTelegramId,
        ...body,
        shopItems: body.shopItems ? { create: body.shopItems } : undefined,
        premiumShopItems: body.premiumShopItems ? { create: body.premiumShopItems } : undefined,
        tasks: body.tasks ? { create: body.tasks } : undefined,
        dailyReward: body.dailyReward ? { create: body.dailyReward } : undefined,
      },
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

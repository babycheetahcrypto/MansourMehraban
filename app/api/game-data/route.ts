import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const telegramId = searchParams.get('telegramId');

  if (!telegramId) {
    return NextResponse.json({ error: 'Telegram ID is required' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { telegramId },
      include: {
        shopItems: true,
        premiumShopItems: true,
        tasks: true,
        dailyReward: true,
        trophies: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user,
      shopItems: user.shopItems,
      premiumShopItems: user.premiumShopItems,
      tasks: user.tasks,
    });
  } catch (error) {
    console.error('Error fetching game data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

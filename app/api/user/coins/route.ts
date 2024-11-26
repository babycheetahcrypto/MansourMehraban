import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const telegramId = searchParams.get('telegramId');

    if (!telegramId) {
      return NextResponse.json({ error: 'Telegram ID is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: {
        telegramId: parseInt(telegramId),
      },
      select: {
        coins: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch coins' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { telegramId, amount } = await request.json();

    if (!telegramId || amount === undefined) {
      return NextResponse.json({ error: 'Telegram ID and amount are required' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: {
        telegramId: telegramId,
      },
      data: {
        coins: {
          increment: amount,
        },
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update coins' }, { status: 500 });
  }
}

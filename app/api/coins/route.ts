import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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
    console.error('Error updating coins:', error);
    return NextResponse.json({ error: 'Failed to update coins' }, { status: 500 });
  }
}

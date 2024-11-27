import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const runtime = 'edge';
export const preferredRegion = 'auto';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { telegramId, amount } = data;

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

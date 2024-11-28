import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const runtime = 'edge';
export const preferredRegion = 'auto';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const telegramId = request.headers.get('x-telegram-id');

  if (!telegramId) {
    return NextResponse.json({ error: 'Telegram ID is required' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { telegramId: parseInt(telegramId) },
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

    const updatedUser = await prisma.user.upsert({
      where: { telegramId: parseInt(telegramId) },
      update: {
        username,
        firstName,
        lastName,
        coins,
        level,
        exp,
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

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

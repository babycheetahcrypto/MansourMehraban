import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const runtime = 'edge';
export const preferredRegion = 'auto';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const { users } = await request.json();

    if (!users.telegramId) {
      return NextResponse.json({ error: 'Telegram ID is required' }, { status: 400 });
    }

    const updatedUser = await prisma.user.upsert({
      where: {
        telegramId: users.telegramId,
      },
      update: {
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        coins: users.coins || 0,
        level: users.level || 1,
        exp: users.exp || 0,
      },
      create: {
        telegramId: users.telegramId,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        coins: users.coins || 0,
        level: users.level || 1,
        exp: users.exp || 0,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Failed to register user' }, { status: 500 });
  }
}

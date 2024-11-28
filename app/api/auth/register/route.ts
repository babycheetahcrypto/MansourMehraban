import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

const prisma = new PrismaClient().$extends(withAccelerate());

export const runtime = 'edge';
export const preferredRegion = 'auto';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const { user } = await request.json();

    if (!user.telegramId) {
      return NextResponse.json({ error: 'Telegram ID is required' }, { status: 400 });
    }

    const updatedUser = await prisma.user.upsert({
      where: {
        telegramId: user.telegramId,
      },
      update: {
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      create: {
        telegramId: user.telegramId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        coins: 0,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Failed to register user' }, { status: 500 });
  }
}

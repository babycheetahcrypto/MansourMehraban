import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

interface UserData {
  telegramId: number;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  coins?: number;
}

export async function POST(request: Request) {
  try {
    const { user }: { user: UserData } = await request.json();

    if (!user.telegramId) {
      return NextResponse.json({ error: 'Telegram ID is required' }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: {
        telegramId: user.telegramId,
      },
    });

    if (existingUser) {
      // Update existing user
      const updatedUser = await prisma.user.update({
        where: {
          telegramId: user.telegramId,
        },
        data: {
          username: user.username ?? null,
          firstName: user.firstName ?? null,
          lastName: user.lastName ?? null,
        },
      });
      return NextResponse.json(updatedUser);
    }

    // Create new user with initial coins
    const newUser = await prisma.user.create({
      data: {
        telegramId: user.telegramId,
        username: user.username ?? null,
        firstName: user.firstName ?? null,
        lastName: user.lastName ?? null,
        coins: 0, // Initial coins
      },
    });

    return NextResponse.json(newUser);
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Failed to register user' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Add segment config
export const runtime = 'edge';
export const preferredRegion = 'auto';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    // Get telegramId from header instead of searchParams
    const telegramId = req.headers.get('x-telegram-id');

    if (!telegramId) {
      return NextResponse.json({ error: 'Telegram ID is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: {
        telegramId: Number(telegramId),
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
  }
}

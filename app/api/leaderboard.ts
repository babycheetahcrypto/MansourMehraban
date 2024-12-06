import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        telegramId: true,
        username: true,
        coins: true,
        profitPerHour: true,
      },
      orderBy: {
        coins: 'desc',
      },
      take: 100,
    });

    const leaderboard = users.map((user, index) => ({
      id: user.id,
      telegramId: user.telegramId,
      name: user.username,
      coins: user.coins,
      profitPerHour: user.profitPerHour,
      rank: index + 1,
    }));

    return NextResponse.json(leaderboard);
  } catch (error: unknown) {
    console.error('Error fetching leaderboard:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard', details: errorMessage },
      { status: 500 }
    );
  }
}

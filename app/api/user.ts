import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Best practice: Create a single PrismaClient instance
const prisma = new PrismaClient();

// GET endpoint to fetch user data
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const telegramId = searchParams.get('telegramId');

  // Validate input
  if (!telegramId) {
    return NextResponse.json({ error: 'Telegram ID is required' }, { status: 400 });
  }

  try {
    // Find user with all related data
    const user = await prisma.user.findUnique({
      where: {
        telegramId: parseInt(telegramId),
      },
      include: {
        shopItems: true,
        premiumShopItems: true,
        tasks: true,
        dailyReward: true,
        trophies: true,
        referralRewards: true,
        sentInvites: true,
        receivedInvites: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    // Good practice to disconnect after operation
    await prisma.$disconnect();
  }
}

// POST endpoint to create or update user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { telegramId, username, firstName, lastName, coins, level, exp } = body;

    // Validate required fields
    if (!telegramId) {
      return NextResponse.json({ error: 'Telegram ID is required' }, { status: 400 });
    }

    // Create or update user
    const user = await prisma.user.upsert({
      where: {
        telegramId: parseInt(telegramId),
      },
      update: {
        username,
        firstName, // Added firstName
        lastName, // Added lastName
        coins: coins !== undefined ? coins : undefined,
        level: level !== undefined ? level : undefined,
        exp: exp !== undefined ? exp : undefined,
        updatedAt: new Date(),
      },
      create: {
        telegramId: parseInt(telegramId),
        username,
        firstName: firstName || '', // Added firstName with default
        lastName: lastName || '', // Added lastName with default
        coins: coins || 0,
        level: level || 1,
        exp: exp || 0,
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// PATCH endpoint to update user data
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { telegramId, ...updateData } = body;

    // Validate required fields
    if (!telegramId) {
      return NextResponse.json({ error: 'Telegram ID is required' }, { status: 400 });
    }

    // Update user
    const user = await prisma.user.update({
      where: {
        telegramId: parseInt(telegramId),
      },
      data: updateData,
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const shopItems = await prisma.shopItem.findMany();
    const premiumShopItems = await prisma.premiumShopItem.findMany();
    return NextResponse.json({ shopItems, premiumShopItems });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { telegramId, itemId, isPremium, price } = body;

    if (!telegramId || !itemId || typeof isPremium !== 'boolean' || !price) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { telegramId: parseInt(telegramId) },
    });

    if (!user || user.coins < price) {
      return NextResponse.json({ error: 'Not enough coins' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { telegramId: parseInt(telegramId) },
      data: { coins: user.coins - price },
    });

    let updatedItem;
    if (isPremium) {
      updatedItem = await prisma.premiumShopItem.update({
        where: { id: itemId },
        data: { level: { increment: 1 } },
      });
    } else {
      updatedItem = await prisma.shopItem.update({
        where: { id: itemId },
        data: { level: { increment: 1 } },
      });
    }

    return NextResponse.json({
      success: true,
      updatedItem,
      updatedCoins: updatedUser.coins,
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

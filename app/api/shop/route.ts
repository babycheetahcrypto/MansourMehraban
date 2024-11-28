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
    const { itemId, isPremium, newLevel } = body;

    if (!itemId || typeof isPremium !== 'boolean' || !newLevel) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const updatedItem = isPremium
      ? await prisma.premiumShopItem.update({
          where: { id: itemId },
          data: { level: newLevel },
        })
      : await prisma.shopItem.update({
          where: { id: itemId },
          data: { level: newLevel },
        });

    return NextResponse.json({ success: true, updatedItem });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

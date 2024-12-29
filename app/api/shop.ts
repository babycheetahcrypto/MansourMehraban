import prisma from '@/lib/prisma';

export async function purchaseItem(userId: string, itemName: string, itemImage: string, itemPrice: number, isPremium: boolean, itemEffect?: string, itemProfit?: number) {
  if (isPremium) {
    return await prisma.premiumShopItem.create({
      data: {
        name: itemName,
        image: itemImage,
        basePrice: itemPrice,
        effect: itemEffect || '',
        user: { connect: { id: userId } },
      },
    });
  } else {
    return await prisma.shopItem.create({
      data: {
        name: itemName,
        image: itemImage,
        basePrice: itemPrice,
        baseProfit: itemProfit || 0,
        level: 1,
        user: { connect: { id: userId } },
      },
    });
  }
}
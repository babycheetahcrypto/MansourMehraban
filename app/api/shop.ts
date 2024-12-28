import prisma from '@/lib/prisma';


async function purchaseItem(userId: string, itemName: string, itemImage: string, itemPrice: number, isPremium: boolean, itemEffect?: string, itemProfit?: number) {
  let purchasedItem;

  if (isPremium) {
    purchasedItem = await prisma.premiumShopItem.create({
      data: {
        user: { connect: { id: userId } },
        name: itemName,
        image: itemImage,
        basePrice: itemPrice,
        effect: itemEffect || '',
      },
    })
  } else {
    purchasedItem = await prisma.shopItem.create({
      data: {
        user: { connect: { id: userId } },
        name: itemName,
        image: itemImage,
        basePrice: itemPrice,
        baseProfit: itemProfit || 0,
        level: 1,
      },
    })
  }

  return purchasedItem;
}


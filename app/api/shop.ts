import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

// Example usage
async function main() {
  const premiumItem = await purchaseItem("user1", "Premium Sword", "premium_sword.png", 100, true, "Increased damage");
  console.log("Premium Item:", premiumItem);

  const regularItem = await purchaseItem("user1", "Wooden Sword", "wooden_sword.png", 10, false, undefined, 5);
  console.log("Regular Item:", regularItem);
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


import { NextApiRequest, NextApiResponse } from 'next'
import { dbOperations } from 'telegram-bot'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { userId, itemName, itemImage, itemPrice, isPremium, itemEffect, itemProfit } = req.body;

    try {
      let purchasedItem;
      if (isPremium) {
        purchasedItem = await dbOperations.purchaseItem(userId, {
          name: itemName,
          image: itemImage,
          basePrice: itemPrice,
          effect: itemEffect || '',
        });
      } else {
        purchasedItem = await dbOperations.purchaseItem(userId, {
          name: itemName,
          image: itemImage,
          basePrice: itemPrice,
          baseProfit: itemProfit || 0,
          level: 1,
        });
      }
      res.status(200).json(purchasedItem);
    } catch (error) {
      res.status(500).json({ error: 'Failed to purchase item' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
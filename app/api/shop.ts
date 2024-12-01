import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const shopItems = await prisma.shopItem.findMany();
      const premiumShopItems = await prisma.premiumShopItem.findMany();
      res.status(200).json({ shopItems, premiumShopItems });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    const { userId, itemId, isPremium } = req.body;

    if (!userId || !itemId || typeof userId !== 'string' || typeof itemId !== 'string') {
      return res.status(400).json({ error: 'Valid User ID and Item ID are required' });
    }

    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      let updatedItem;
      if (isPremium) {
        updatedItem = await prisma.premiumShopItem.update({
          where: { id: itemId },
          data: { level: { increment: 1 } },
        });
      } else {
        updatedItem = await prisma.shopItem.update({
          where: { id: itemId },
          data: { quantity: { increment: 1 } },
        });
      }

      res.status(200).json(updatedItem);
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

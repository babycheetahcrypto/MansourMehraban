import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { userId, itemId } = req.body;

    if (!userId || !itemId) {
      return res.status(400).json({ error: 'User ID and Item ID are required' });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { shopItems: true },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const item = user.shopItems.find(item => item.id === itemId);

      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }

      const currentPrice = item.basePrice * Math.pow(1.5, item.level - 1);

      if (user.coins < currentPrice) {
        return res.status(400).json({ error: 'Not enough coins' });
      }

      const [updatedItem, updatedUser] = await prisma.$transaction([
        prisma.shopItem.update({
          where: { id: itemId },
          data: { level: { increment: 1 } },
        }),
        prisma.user.update({
          where: { id: userId },
          data: {
            coins: { decrement: currentPrice },
            profitPerHour: { increment: item.baseProfit },
          },
          include: { shopItems: true },
        }),
      ]);

      res.status(200).json({
        updatedUser,
        newProfit: item.baseProfit * updatedItem.level,
      });
    } catch (error) {
      console.error('Error purchasing item:', error);
      res.status(500).json({ error: 'Failed to process purchase' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}


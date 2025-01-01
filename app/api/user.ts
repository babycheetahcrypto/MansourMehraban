import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const { telegramId } = req.query;

      if (!telegramId) {
        return res.status(400).json({ error: 'Telegram ID is required' });
      }

      let user = await prisma.user.findUnique({
        where: { telegramId: telegramId as string },
        include: {
          shopItems: true,
          tasks: true,
          dailyReward: true,
        },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            telegramId: telegramId as string,
            coins: 0,
            level: 1,
            exp: 0,
            clickPower: 1,
          },
          include: {
            shopItems: true,
            tasks: true,
            dailyReward: true,
          },
        });
      }

      res.status(200).json(user);
    } else if (req.method === 'PATCH') {
      const { telegramId, ...updateData } = req.body;

      if (!telegramId) {
        return res.status(400).json({ error: 'Telegram ID is required' });
      }

      const updatedUser = await prisma.user.update({
        where: { telegramId: telegramId as string },
        data: updateData,
        include: {
          shopItems: true,
          tasks: true,
          dailyReward: true,
        },
      });

      res.status(200).json(updatedUser);
    } else {
      res.setHeader('Allow', ['GET', 'PATCH']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error in user API:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}


import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'Valid User ID is required' });
    }

    try {
      const dailyReward = await prisma.dailyReward.findUnique({
        where: { userId },
      });
      res.status(200).json(dailyReward);
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    const { userId } = req.body;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'Valid User ID is required' });
    }

    try {
      const updatedDailyReward = await prisma.dailyReward.upsert({
        where: { userId },
        update: {
          lastClaimed: new Date(),
          streak: { increment: 1 },
          day: { increment: 1 },
        },
        create: {
          userId,
          lastClaimed: new Date(),
          streak: 1,
          day: 1,
        },
      });

      res.status(200).json(updatedDailyReward);
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          telegramId: true,
          username: true,
          coins: true,
          profitPerHour: true,
        },
        orderBy: {
          coins: 'desc',
        },
        take: 100,
      });

      const leaderboard = users.map((user: any, index: number) => ({
        id: user.id,
        telegramId: user.telegramId,
        name: user.username,
        coins: user.coins,
        profitPerHour: user.profitPerHour,
        rank: index + 1,
      }));

      res.status(200).json(leaderboard);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

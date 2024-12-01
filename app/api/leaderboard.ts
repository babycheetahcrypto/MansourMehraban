import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const leaderboard = await prisma.user.findMany({
        select: {
          id: true,
          telegramId: true,
          username: true,
          coins: true,
          level: true,
          profitPerHour: true,
        },
        orderBy: [{ coins: 'desc' }, { level: 'desc' }],
        take: 100,
      });

      const leaderboardWithRanks = leaderboard.map((user, index) => ({
        ...user,
        rank: index + 1,
      }));

      res.status(200).json(leaderboardWithRanks);
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const leaderboard = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        coins: true,
        profitPerHour: true,
      },
      orderBy: {
        coins: 'desc',
      },
      take: 100, // Limit to top 100 players
    });

    res.status(200).json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

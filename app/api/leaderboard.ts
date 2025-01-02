import { NextApiRequest, NextApiResponse } from 'next';
import { getLeaderboard } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const leaderboard = await getLeaderboard();
      const formattedLeaderboard = leaderboard.map((entry, index) => ({
        ...entry,
        rank: index + 1,
        coins: Math.floor(entry.coins),
        profitPerHour: Math.floor(entry.profitPerHour)
      }));
      res.status(200).json(formattedLeaderboard);
    } catch (error) {
      console.error('Failed to fetch leaderboard data:', error);
      res.status(500).json({ error: 'Failed to fetch leaderboard data' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}


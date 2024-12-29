import { NextApiRequest, NextApiResponse } from 'next'
import { dbOperations } from 'telegram-bot'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const leaderboard = await dbOperations.getLeaderboard();
      const leaderboardWithRanks = leaderboard.map((user, index) => ({
        ...user,
        rank: index + 1,
      }));
      res.status(200).json(leaderboardWithRanks);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch leaderboard data' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
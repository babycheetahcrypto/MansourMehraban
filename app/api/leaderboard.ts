import { NextApiRequest, NextApiResponse } from 'next';
import { clientPromise } from '../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const client = await clientPromise;
      const db = client.db('babycheetah');

      const users = await db
        .collection('users')
        .find(
          {},
          {
            projection: {
              id: '$_id',
              telegramId: 1,
              username: 1,
              coins: 1,
              profitPerHour: 1,
            },
            sort: { coins: -1 },
            limit: 100,
          }
        )
        .toArray();

      const leaderboard = users.map((user, index) => ({
        id: user._id.toString(),
        telegramId: user.telegramId,
        name: user.username,
        coins: user.coins,
        profitPerHour: user.profitPerHour,
        rank: index + 1,
      }));

      res.status(200).json(leaderboard);
    } catch (error: unknown) {
      console.error('Error fetching leaderboard:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ error: 'Failed to fetch leaderboard', details: errorMessage });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/firebaseConfig';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const usersCollection = collection(db, 'users');
      const leaderboardQuery = query(
        usersCollection,
        orderBy('coins', 'desc'),
        limit(100)
      );

      const querySnapshot = await getDocs(leaderboardQuery);
      const leaderboard = querySnapshot.docs.map((doc, index) => {
        const data = doc.data();
        return {
          id: doc.id,
          telegramId: data.telegramId,
          username: data.username,
          firstName: data.firstName,
          lastName: data.lastName,
          coins: data.coins,
          profitPerHour: data.profitPerHour,
          rank: index + 1,
        };
      });

      res.status(200).json(leaderboard);
    } catch (error) {
      console.error('Failed to fetch leaderboard data:', error);
      res.status(500).json({ error: 'Failed to fetch leaderboard data' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
import { NextApiRequest, NextApiResponse } from 'next';
import { clientPromise } from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const client = await clientPromise;
  const db = client.db('babycheetah');

  if (req.method === 'GET') {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'Valid User ID is required' });
    }

    try {
      const dailyReward = await db
        .collection('dailyRewards')
        .findOne({ userId: new ObjectId(userId) });
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
      const updatedDailyReward = await db.collection('dailyRewards').findOneAndUpdate(
        { userId: new ObjectId(userId) },
        {
          $set: { lastClaimed: new Date() },
          $inc: { streak: 1, day: 1 },
        },
        { upsert: true, returnDocument: 'after' }
      );

      res.status(200).json(updatedDailyReward.value);
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

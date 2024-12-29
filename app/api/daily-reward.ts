import { NextApiRequest, NextApiResponse } from 'next';
import { dbOperations } from 'telegram-bot';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    try {
      const dailyReward = await dbOperations.getDailyReward(userId as string);
      res.status(200).json(dailyReward);
    } catch (error) {
      console.error('Failed to fetch daily reward data:', error);
      res.status(500).json({ error: 'Failed to fetch daily reward data' });
    }
  } else if (req.method === 'PATCH') {
    const { userId, lastClaimed, streak, day, completed } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    try {
      const updatedDailyReward = await dbOperations.updateDailyReward(userId, { lastClaimed, streak, day, completed });
      res.status(200).json(updatedDailyReward);
    } catch (error) {
      console.error('Failed to update daily reward data:', error);
      res.status(500).json({ error: 'Failed to update daily reward data' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PATCH']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
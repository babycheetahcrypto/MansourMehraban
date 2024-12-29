import { NextApiRequest, NextApiResponse } from 'next'
import { dbOperations } from 'telegram-bot'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'Valid User ID is required' });
    }

    try {
      const user = await dbOperations.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.status(200).json({ level: user.level, exp: user.exp, unlockedLevels: user.unlockedLevels });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'PUT') {
    const { userId, level, exp, unlockedLevels } = req.body;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'Valid User ID is required' });
    }

    try {
      const updatedUser = await dbOperations.updateUser(userId, { level, exp, unlockedLevels });
      res.status(200).json({ level: updatedUser.level, exp: updatedUser.exp, unlockedLevels: updatedUser.unlockedLevels });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
// pages/api/user.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { User } from '../../models/User';
import { connectToDatabase } from '../../utils/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;

  try {
    await connectToDatabase();

    const user = await User.findOne({ telegramId: userId });
    if (!user) return res.status(404).json({ error: 'User  not found' });
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

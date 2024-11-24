import { NextApiRequest, NextApiResponse } from 'next';
import { User } from '../../models/User';
import { connectToDatabase } from '../../utils/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, coins } = req.body;

  try {
    await connectToDatabase();

    const user = await User.findOne({ telegramId: userId });
    if (user) {
      user.coins += coins;
      await user.save();
      return res.json(user);
    }
    return res.status(404).json({ error: 'User  not found' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

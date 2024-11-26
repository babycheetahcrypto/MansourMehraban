import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../utils/database';
import { User } from '../../../models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, points } = req.body;

  try {
    await connectToDatabase();

    const user = await User.findOne({ telegramId: userId });

    if (!user) {
      return res.status(404).json({ error: 'User  not found' });
    }

    user.coins += points; // or however you want to increase points
    await user.save();

    return res.status(200).json({ message: 'Points increased successfully', user });
  } catch (error) {
    console.error('Error increasing points:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

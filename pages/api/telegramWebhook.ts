import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../utils/database';
import User from '../../models/User';
import { validateTelegramInitData } from '../../utils/telegramAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const initData = req.body.init_data;

  if (!validateTelegramInitData(initData)) {
    return res.status(400).json({ message: 'Invalid init data' });
  }

  const userData = new URLSearchParams(initData);
  const telegramId = userData.get('id');
  const username = userData.get('username');
  const firstName = userData.get('first_name');
  const lastName = userData.get('last_name');

  await connectToDatabase();

  const user = await User.findOneAndUpdate(
    { telegramId },
    { username, firstName, lastName },
    { new: true, upsert: true }
  );

  return res.status(200).json({ message: 'User  data saved', user });
}

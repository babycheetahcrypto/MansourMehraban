import { NextApiRequest, NextApiResponse } from 'next';
import { getUser, updateUser, createUser } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { telegramId } = req.query;
    if (!telegramId) {
      return res.status(400).json({ error: 'Telegram ID is required' });
    }

    try {
      const user = await getUser(telegramId as string);
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'PATCH') {
    const userData = req.body;
    if (!userData || !userData.id) {
      return res.status(400).json({ error: 'Invalid user data' });
    }

    try {
      await updateUser(userData.id, userData);
      res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    const userData = req.body;
    if (!userData || !userData.id) {
      return res.status(400).json({ error: 'Invalid user data' });
    }

    try {
      await createUser(userData);
      res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PATCH', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
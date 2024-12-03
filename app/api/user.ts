// pages/api/user.ts
import clientPromise from '@/lib/mongodb'; // Adjust the path as necessary
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const client = await clientPromise;
  const db = client.db('your_database_name'); // Replace with your database name

  if (req.method === 'GET') {
    const { telegramId } = req.query;
    const user = await db.collection('users').findOne({ telegramId });
    if (user) {
      return res.status(200).json(user);
    } else {
      return res.status(404).json({ message: 'User  not found' });
    }
  }

  if (req.method === 'POST') {
    const newUser = req.body;
    await db.collection('users').insertOne(newUser);
    return res.status(201).json(newUser);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

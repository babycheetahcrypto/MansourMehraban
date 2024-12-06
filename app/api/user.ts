import { NextApiRequest, NextApiResponse } from 'next';
import { clientPromise } from '../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const client = await clientPromise;
  const db = client.db('babycheetah');

  switch (req.method) {
    case 'GET':
      try {
        const { telegramId } = req.query;
        const user = await db.collection('users').findOne({ telegramId: telegramId });
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
      } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ error: 'Error fetching user data' });
      }
      break;

    case 'POST':
      try {
        const newUser = req.body;
        const result = await db.collection('users').insertOne(newUser);
        res.status(201).json({ user: { ...newUser, _id: result.insertedId } });
      } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Error creating user' });
      }
      break;

    case 'PATCH':
      try {
        const { telegramId, ...updatedData } = req.body;
        const result = await db
          .collection('users')
          .findOneAndUpdate(
            { telegramId: telegramId },
            { $set: updatedData },
            { returnDocument: 'after' }
          );
        if (!result.value) {
          return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(result.value);
      } catch (error) {
        console.error('Error updating user data:', error);
        res.status(500).json({ error: 'Error updating user data' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PATCH']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

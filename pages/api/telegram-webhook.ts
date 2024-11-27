import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { message } = req.body;

    if (message && message.from) {
      const { id: telegramId, first_name, last_name, username } = message.from;

      try {
        const client = await clientPromise;
        const db = client.db('cryptoGame');

        await db.collection('users').updateOne(
          { telegramId: telegramId.toString() },
          {
            $set: {
              name: `${first_name} ${last_name || ''}`.trim(),
              username: username || '',
              lastInteraction: new Date(),
            },
            $setOnInsert: { coins: 0, level: 1, exp: 0 },
          },
          { upsert: true }
        );

        res.status(200).json({ message: 'User data updated' });
      } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    } else {
      res.status(400).json({ error: 'Invalid message format' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

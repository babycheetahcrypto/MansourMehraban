import { NextApiRequest, NextApiResponse } from 'next'
import { dbOperations } from 'telegram-bot'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    const { userId, trophyId, data } = req.body;

    try {
      const updatedTrophy = await dbOperations.updateTrophy(userId, trophyId, data);
      res.status(200).json(updatedTrophy);
    } catch (error) {
      console.error("Error updating trophy:", error);
      res.status(500).json({ error: 'Failed to update trophy' });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
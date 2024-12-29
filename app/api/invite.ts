import { NextApiRequest, NextApiResponse } from 'next'
import { dbOperations } from 'telegram-bot'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { userId, friendId } = req.body

    if (!userId || !friendId) {
      return res.status(400).json({ error: 'User ID and Friend ID are required' })
    }

    try {
      const updatedUser = await dbOperations.inviteFriend(userId, friendId);
      res.status(200).json({ message: 'Friend invited successfully', user: updatedUser })
    } catch (error) {
      res.status(500).json({ error: 'Failed to process invitation' })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
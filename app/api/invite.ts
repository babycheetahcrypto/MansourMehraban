import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { userId, friendId } = req.body

    if (!userId || !friendId) {
      return res.status(400).json({ error: 'User ID and Friend ID are required' })
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      // Update user's friendsCoins
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          friendsCoins: {
            ...(user.friendsCoins as object),
            [friendId]: 0,
          },
        },
      })

      // Add coins to the user for inviting a friend
      const inviteReward = 2000
      await prisma.user.update({
        where: { id: userId },
        data: {
          coins: {
            increment: inviteReward,
          },
        },
      })

      res.status(200).json({ message: 'Friend invited successfully', user: updatedUser })
    } catch (error) {
      console.error('Error inviting friend:', error)
      res.status(500).json({ error: 'Failed to process invitation' })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}


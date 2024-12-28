import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { telegramId } = req.query

    if (!telegramId) {
      return res.status(400).json({ error: 'Telegram ID is required' })
    }

    try {
      const user = await prisma.user.findUnique({
        where: { telegramId: telegramId as string },
        include: {
          shopItems: true,
          premiumShopItems: true,
          tasks: true,
          trophies: true,
          dailyReward: true,
        },
      })

      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      res.status(200).json(user)
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user data' })
    }
  } else if (req.method === 'PATCH') {
    const { telegramId, ...updateData } = req.body

    if (!telegramId) {
      return res.status(400).json({ error: 'Telegram ID is required' })
    }

    try {
      const updatedUser = await prisma.user.update({
        where: { telegramId },
        data: updateData,
      })

      res.status(200).json(updatedUser)
    } catch (error) {
      res.status(500).json({ error: 'Failed to update user data' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'PATCH'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
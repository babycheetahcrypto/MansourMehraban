import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { userId } = req.query

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' })
    }

    try {
      const dailyReward = await prisma.dailyReward.findUnique({
        where: { userId: userId as string },
      })

      res.status(200).json(dailyReward)
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch daily reward data' })
    }
  } else if (req.method === 'PATCH') {
    const { userId, lastClaimed, streak, day, completed } = req.body

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' })
    }

    try {
      const updatedDailyReward = await prisma.dailyReward.upsert({
        where: { userId: userId as string },
        update: { lastClaimed, streak, day, completed },
        create: { userId: userId as string, lastClaimed, streak, day, completed },
      })

      res.status(200).json(updatedDailyReward)
    } catch (error) {
      res.status(500).json({ error: 'Failed to update daily reward data' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'PATCH'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
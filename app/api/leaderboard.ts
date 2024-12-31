import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const leaderboard = await prisma.user.findMany({
        select: {
          id: true,
          telegramId: true,
          username: true,
          firstName: true,
          lastName: true,
          coins: true,
          profitPerHour: true,
        },
        orderBy: {
          coins: 'desc',
        },
        take: 100,
      })

      const leaderboardWithRanks = leaderboard.map((user, index) => ({
        ...user,
        rank: index + 1,
      }))

      res.status(200).json(leaderboardWithRanks)
    } catch (error) {
      console.error('Failed to fetch leaderboard data:', error)
      res.status(500).json({ error: 'Failed to fetch leaderboard data' })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}


import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Check database connection
    await prisma.$connect()
    
    res.status(200).json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      database: 'Connected',
      environment: process.env.NODE_ENV
    })
  } catch (error) {
    console.error('Health check failed:', error)
    res.status(500).json({ 
      status: 'Error', 
      timestamp: new Date().toISOString(),
      error: 'Failed to connect to the database'
    })
  } finally {
    await prisma.$disconnect()
  }
}


import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('Health check requested');
  try {
    // Check database connection
    await prisma.$connect()
    console.log('Database connection successful');
    
    // Check if we can perform a simple query
    const userCount = await prisma.user.count();
    console.log(`Database query successful. User count: ${userCount}`);
    
    res.status(200).json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      database: 'Connected',
      databaseQuery: 'Successful',
      userCount: userCount,
      environment: process.env.NODE_ENV,
      api_url: process.env.NEXT_PUBLIC_API_URL,
      webapp_url: process.env.NEXT_PUBLIC_WEBAPP_URL
    })
  } catch (error) {
    console.error('Health check failed:', error)
    res.status(500).json({ 
      status: 'Error', 
      timestamp: new Date().toISOString(),
      error: 'Failed to connect to the database or perform query',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  } finally {
    await prisma.$disconnect()
  }
}


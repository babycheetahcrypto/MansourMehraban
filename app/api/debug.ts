import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('Debug endpoint requested');
  try {
    // Check database connection
    await prisma.$connect()
    console.log('Database connection successful');
    
    // Fetch some sample data
    const userCount = await prisma.user.count();
    const sampleUser = await prisma.user.findFirst();
    
    // Check environment variables
    const envVars = {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ? 'Set' : 'Not set',
      NEXT_PUBLIC_WEBAPP_URL: process.env.NEXT_PUBLIC_WEBAPP_URL ? 'Set' : 'Not set',
      DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
    };
    
    res.status(200).json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      database: 'Connected',
      userCount: userCount,
      sampleUser: sampleUser ? {
        id: sampleUser.id,
        telegramId: sampleUser.telegramId,
        username: sampleUser.username,
      } : null,
      environment: process.env.NODE_ENV,
      environmentVariables: envVars,
      api_url: process.env.NEXT_PUBLIC_API_URL,
      webapp_url: process.env.NEXT_PUBLIC_WEBAPP_URL
    })
  } catch (error) {
    console.error('Debug check failed:', error)
    res.status(500).json({ 
      status: 'Error', 
      timestamp: new Date().toISOString(),
      error: 'Failed to perform debug checks',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  } finally {
    await prisma.$disconnect()
  }
}


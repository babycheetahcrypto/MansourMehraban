import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

interface HealthStatus {
  status: string;
  timestamp: string;
  database: string;
  databaseQuery: string;
  userCount: number;
  environment: string | undefined;
  environmentVariables: {
    NEXT_PUBLIC_API_URL: string;
    NEXT_PUBLIC_WEBAPP_URL: string;
    DATABASE_URL: string;
    TELEGRAM_BOT_TOKEN: string;
  };
  api_url: string | undefined;
  webapp_url: string | undefined;
  error?: string;
  errorDetails?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('Health check requested');
  const healthStatus: HealthStatus = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: 'Not checked',
    databaseQuery: 'Not performed',
    userCount: 0,
    environment: process.env.NODE_ENV,
    environmentVariables: {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ? 'Set' : 'Not set',
      NEXT_PUBLIC_WEBAPP_URL: process.env.NEXT_PUBLIC_WEBAPP_URL ? 'Set' : 'Not set',
      DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
      TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN ? 'Set' : 'Not set',
    },
    api_url: process.env.NEXT_PUBLIC_API_URL,
    webapp_url: process.env.NEXT_PUBLIC_WEBAPP_URL
  };

  try {
    // Check database connection
    await prisma.$connect()
    healthStatus.database = 'Connected';
    console.log('Database connection successful');
    
    // Check if we can perform a simple query
    const userCount = await prisma.user.count();
    healthStatus.databaseQuery = 'Successful';
    healthStatus.userCount = userCount;
    console.log(`Database query successful. User count: ${userCount}`);
    
  } catch (error) {
    console.error('Health check failed:', error)
    healthStatus.status = 'Error';
    healthStatus.database = 'Failed to connect';
    healthStatus.databaseQuery = 'Failed';
    healthStatus.error = 'Failed to connect to the database or perform query';
    healthStatus.errorDetails = error instanceof Error ? error.message : 'Unknown error';
  } finally {
    await prisma.$disconnect()
  }

  if (healthStatus.status === 'OK') {
    res.status(200).json(healthStatus);
  } else {
    res.status(500).json(healthStatus);
  }
}


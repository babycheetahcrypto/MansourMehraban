import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../lib/prisma'

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
  error?: string;
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
  };

  try {
    console.log('Checking environment variables...');
    const requiredEnvVars = ['NEXT_PUBLIC_API_URL', 'NEXT_PUBLIC_WEBAPP_URL', 'DATABASE_URL', 'TELEGRAM_BOT_TOKEN'];
    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingEnvVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    }

    console.log('Attempting to connect to the database...');
    await prisma.$connect()
    healthStatus.database = 'Connected';
    console.log('Database connection successful');
    
    console.log('Attempting to perform a simple query...');
    const userCount = await prisma.user.count();
    healthStatus.databaseQuery = 'Successful';
    healthStatus.userCount = userCount;
    console.log(`Database query successful. User count: ${userCount}`);
    
  } catch (error) {
    console.error('Health check failed:', error)
    healthStatus.status = 'Error';
    healthStatus.database = 'Failed to connect';
    healthStatus.databaseQuery = 'Failed';
    healthStatus.error = error instanceof Error ? error.message : 'Unknown error';
  } finally {
    await prisma.$disconnect()
  }

  console.log('Health check result:', JSON.stringify(healthStatus, null, 2));

  res.status(healthStatus.status === 'OK' ? 200 : 500).json(healthStatus);
}


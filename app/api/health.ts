import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

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
    FIREBASE_PROJECT_ID: string;
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
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ? 'Set' : 'Not set',
      TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN ? 'Set' : 'Not set',
    },
  };

  try {
    console.log('Checking environment variables...');
    const requiredEnvVars = ['NEXT_PUBLIC_API_URL', 'NEXT_PUBLIC_WEBAPP_URL', 'FIREBASE_PROJECT_ID', 'TELEGRAM_BOT_TOKEN'];
    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingEnvVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    }

    console.log('Attempting to connect to the database...');
    const usersCollection = collection(db, 'users');
    healthStatus.database = 'Connected';
    console.log('Database connection successful');
    
    console.log('Attempting to perform a simple query...');
    const querySnapshot = await getDocs(usersCollection);
    healthStatus.databaseQuery = 'Successful';
    healthStatus.userCount = querySnapshot.size;
    console.log(`Database query successful. User count: ${healthStatus.userCount}`);
    
  } catch (error) {
    console.error('Health check failed:', error);
    healthStatus.status = 'Error';
    healthStatus.database = 'Failed to connect';
    healthStatus.databaseQuery = 'Failed';
    healthStatus.error = error instanceof Error ? error.message : 'Unknown error';
  }

  console.log('Health check result:', JSON.stringify(healthStatus, null, 2));

  res.status(healthStatus.status === 'OK' ? 200 : 500).json(healthStatus);
}
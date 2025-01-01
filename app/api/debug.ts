import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/lib/db';
import { collection, getDocs, limit, query } from 'firebase/firestore';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('Debug endpoint requested');
  try {
    console.log('Attempting to connect to the database...');
    const usersCollection = collection(db, 'users');
    const usersQuery = query(usersCollection, limit(1));
    const querySnapshot = await getDocs(usersQuery);
    console.log('Database connection successful');
    
    const userCount = querySnapshot.size;
    const sampleUser = querySnapshot.docs[0]?.data();
    
    const envVars = {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ? 'Set' : 'Not set',
      NEXT_PUBLIC_WEBAPP_URL: process.env.NEXT_PUBLIC_WEBAPP_URL ? 'Set' : 'Not set',
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'Set' : 'Not set',
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
    });
  } catch (error) {
    console.error('Debug check failed:', error);
    res.status(500).json({ 
      status: 'Error', 
      timestamp: new Date().toISOString(),
      error: 'Failed to perform debug checks',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}


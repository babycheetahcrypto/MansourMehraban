import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('Database test requested');
  try {
    console.log('Attempting to connect to the database...');
    await prisma.$connect()
    console.log('Database connection successful');
    
    console.log('Attempting to perform a simple query...');
    const userCount = await prisma.user.count();
    console.log(`Database query successful. User count: ${userCount}`);
    
    res.status(200).json({ status: 'OK', message: 'Database connection and query successful', userCount });
  } catch (error) {
    console.error('Database test failed:', error)
    res.status(500).json({ status: 'Error', message: 'Database connection or query failed', error: error instanceof Error ? error.message : 'Unknown error' });
  } finally {
    await prisma.$disconnect()
  }
}


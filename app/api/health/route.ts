import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect();
    await prisma.$disconnect();

    return NextResponse.json({
      status: 'ok',
      message: 'Service is healthy',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

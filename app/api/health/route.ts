import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await prisma.$connect();

    // Test query
    await prisma.user.findFirst();

    await prisma.$disconnect();

    return NextResponse.json({
      status: 'ok',
      message: 'Database connection successful',
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

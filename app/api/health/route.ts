import { NextResponse } from 'next/server';
import { testMongoDBConnection } from 'lib/mongodb-test';

export async function GET() {
  try {
    const isConnected = await testMongoDBConnection();
    if (!isConnected) {
      return NextResponse.json(
        { status: 'error', message: 'Database connection failed' },
        { status: 500 }
      );
    }
    return NextResponse.json({ status: 'ok', message: 'Service is healthy' });
  } catch (error) {
    return NextResponse.json({ status: 'error', message: String(error) }, { status: 500 });
  }
}

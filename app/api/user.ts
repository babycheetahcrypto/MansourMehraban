import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '../../lib/mongodb';

export async function GET(req: NextRequest) {
  const client = await clientPromise;
  const db = client.db('babycheetah');

  const { searchParams } = new URL(req.url);
  const telegramId = searchParams.get('telegramId');

  if (!telegramId) {
    return NextResponse.json({ error: 'Telegram ID is required' }, { status: 400 });
  }

  try {
    const user = await db.collection('users').findOne({ telegramId: telegramId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching user data' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const client = await clientPromise;
  const db = client.db('babycheetah');

  try {
    const updatedUser = await req.json();
    const result = await db
      .collection('users')
      .updateOne({ telegramId: updatedUser.telegramId }, { $set: updatedUser }, { upsert: true });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Error updating user data' }, { status: 500 });
  }
}

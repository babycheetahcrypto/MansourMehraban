import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../utils/database';
import { User } from '../../../models/User';

export async function POST(req: NextRequest) {
  const { userId, points } = await req.json(); // Parse JSON body

  try {
    await connectToDatabase();

    const user = await User.findOne({ telegramId: userId });

    if (!user) {
      return NextResponse.json({ error: 'User  not found' }, { status: 404 });
    }

    user.coins += points; // Increase points
    await user.save();

    return NextResponse.json({ message: 'Points increased successfully', user });
  } catch (error) {
    console.error('Error increasing points:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

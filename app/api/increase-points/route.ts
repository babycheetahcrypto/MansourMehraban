import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../utils/database'; // Adjust the import path if necessary
import { User } from '../../../models/User'; // Adjust the import path if necessary

export async function POST(req: NextRequest) {
  try {
    // Parse the JSON body of the request
    const { userId, points } = await req.json();

    // Connect to the database
    await connectToDatabase();

    // Find the user by their Telegram ID
    const user = await User.findOne({ telegramId: userId });

    // Check if the user exists
    if (!user) {
      return NextResponse.json({ error: 'User  not found' }, { status: 404 });
    }

    // Increase the user's coins (or points)
    user.coins += points; // Adjust the property name if needed
    await user.save(); // Save the updated user document

    // Return a success response
    return NextResponse.json({ message: 'Points increased successfully', user });
  } catch (error) {
    console.error('Error increasing points:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

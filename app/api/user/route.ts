// app/api/user/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma'; // Adjust the import path as necessary

export async function GET(request: NextRequest) {
  // Add type annotation
  try {
    const users = await prisma.user.findMany(); // Fetch all users
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Add type annotation
  const { username, email } = await request.json();

  try {
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        coins: 0, // Initialize coins to 0 when creating a new user
      },
    });
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

// Example of a function to update coins
export async function PATCH(request: NextRequest) {
  // Add type annotation
  const { userId, coins } = await request.json();

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { coins }, // Update coins for the user
    });
    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error('Error updating coins:', error);
    return NextResponse.json({ error: 'Failed to update coins' }, { status: 500 });
  }
}

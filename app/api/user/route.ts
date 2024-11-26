import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Ensure this path is correct

export async function GET(request: Request) {
  try {
    const users = await prisma.user.findMany();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.error();
  }
}

export async function POST(request: Request) {
  const data = await request.json();
  try {
    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: data.password,
        // Add other fields as necessary
      },
    });
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.error();
  }
}

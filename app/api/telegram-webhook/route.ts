import { NextResponse } from 'next/server';
import bot from '../../../telegram-bot';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await bot.handleUpdate(body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error in telegram webhook:', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
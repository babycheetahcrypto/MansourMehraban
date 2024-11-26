import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const telegram = request.headers.get('user-agent')?.includes('TelegramWebApp');

  if (!telegram && process.env.NODE_ENV === 'production') {
    return NextResponse.redirect(new URL('https://t.me/BabyCheetah_Bot'));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};

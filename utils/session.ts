import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Define a more specific type for the session payload
interface SessionPayload {
  userId?: string;
  username?: string;
  email?: string;
  expires?: number;
  [key: string]: unknown; // Allow additional properties
}

const key = new TextEncoder().encode(process.env.JWT_SECRET);

export const SESSION_DURATION = 60 * 60 * 1000; // 1 hour

export async function encrypt(payload: SessionPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1 hour')
    .sign(key);
}

export async function decrypt(input: string): Promise<SessionPayload> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ['HS256'],
  });
  return payload as SessionPayload;
}

export async function getSession(): Promise<SessionPayload | null> {
  const session = (await cookies()).get('session')?.value;
  console.log('Session value in getSession ', session);
  if (!session) return null;
  return await decrypt(session);
}

export async function updateSession(request: NextRequest): Promise<NextResponse | undefined> {
  const session = request.cookies.get('session')?.value;
  if (!session) return;

  // Refresh the session so it doesn't expire
  const parsed = await decrypt(session);
  parsed.expires = Date.now() + SESSION_DURATION;
  const res = NextResponse.next();
  res.cookies.set({
    name: 'session',
    value: await encrypt(parsed),
    httpOnly: true,
    expires: new Date(parsed.expires),
  });
  return res;
}

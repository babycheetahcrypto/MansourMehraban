import { Suspense } from 'react';
import GameClient from './game-client';
import TelegramInitializer from './TelegramInitializer';

async function getUserData(telegramId: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/user?telegramId=${telegramId}`,
    { cache: 'no-store' }
  );
  if (!response.ok) {
    if (response.status === 404) {
      return null; // User not found, we'll create a new one in the client
    }
    throw new Error('Failed to fetch user data');
  }
  return response.json();
}

export default function Home() {
  return (
    <main>
      <TelegramInitializer />
      <Suspense fallback={<div>Loading...</div>}>
        <GameClient getUserData={getUserData} />
      </Suspense>
    </main>
  );
}

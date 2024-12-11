import { Suspense } from 'react';
import GameClient from './game-client';
import TelegramInitializer from './TelegramInitializer';

export default function Home() {
  return (
    <main>
      <TelegramInitializer />
      <GameClient />
    </main>
  );
}

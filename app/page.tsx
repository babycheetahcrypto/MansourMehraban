import dynamic from 'next/dynamic';

const GameClient = dynamic(() => import('./game-client'), { ssr: false });

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <GameClient />
    </main>
  );
}


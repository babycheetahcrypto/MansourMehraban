import dynamic from 'next/dynamic';

const GameClient = dynamic(() => import('./game-client'), { ssr: false });

export default function Home() {
  return (
    <main>
      <GameClient />
    </main>
  );
}


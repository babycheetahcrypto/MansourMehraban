// app/page.tsx
'use client';

import dynamic from 'next/dynamic';

const CryptoGame = dynamic(() => import('@/components/crypto-game'), { 
  ssr: false, // Ensure this is false to prevent server-side rendering
  loading: () => <p>Loading...</p> // Loading state while the game loads
});

export default function Page() {
  return <CryptoGame />;
}
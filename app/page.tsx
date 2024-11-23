'use client';

import dynamic from 'next/dynamic';

const CryptoGame = dynamic(() => import('@/components/crypto-game'), { 
  ssr: false,
  loading: () => <p>Loading...</p>
});

export default function Page() {
  return <CryptoGame />;
}
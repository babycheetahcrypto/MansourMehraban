// app/page.tsx
'use client';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';

const CryptoGame = dynamic(() => import('@/components/crypto-game'), {
  ssr: false,
});

export default function Page() {
  useEffect(() => {
    const tg = window.Telegram.WebApp;
    const initDataUnsafe = tg.initDataUnsafe;

    // Send the user data to your backend
    fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(initDataUnsafe),
    });
  }, []);

  return <CryptoGame />;
}

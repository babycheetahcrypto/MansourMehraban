'use client';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';

const CryptoGame = dynamic(() => import('@/components/crypto-game'), { 
  ssr: false 
});

export default function Page() {
  useEffect(() => {
    // Ensure Telegram WebApp is initialized
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  }, []);

  return <CryptoGame />;
}
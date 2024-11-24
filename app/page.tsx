'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { WebApp } from '@twa-dev/sdk';

interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  coins?: number;
}

// Dynamically import CryptoGame with type-safe props
const CryptoGame = dynamic(() => import('@/components/crypto-game'), {
  ssr: false,
}) as React.ComponentType<{ user: TelegramUser | null }>;

export default function Page() {
  const [user, setUser] = useState<TelegramUser | null>(null);

  useEffect(() => {
    const initTelegramWebApp = () => {
      if (WebApp && WebApp.initDataUnsafe) {
        const userData = WebApp.initDataUnsafe.user;

        if (userData) {
          setUser({
            id: userData.id,
            first_name: userData.first_name,
            last_name: userData.last_name,
            username: userData.username,
          });
        } else {
          console.error('No Telegram user data available');
        }

        WebApp.ready();
        WebApp.expand();
      }
    };

    initTelegramWebApp();
  }, []);

  return <CryptoGame user={user} />;
}

'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import * as TWAsdk from '@twa-dev/sdk'; // Import entire module

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
      if (TWAsdk.WebApp && TWAsdk.WebApp.initDataUnsafe) {
        const userData = TWAsdk.WebApp.initDataUnsafe.user;

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

        TWAsdk.WebApp.ready();
        TWAsdk.WebApp.expand();
      }
    };

    initTelegramWebApp();
  }, []);

  return <CryptoGame user={user} />;
}

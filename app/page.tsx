// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { User } from '@/types/user';

const CryptoGame = dynamic(() => import('@/components/crypto-game'), {
  ssr: false,
}) as React.ComponentType<{
  userData: User | null;
  onCoinsUpdate: (amount: number) => Promise<void>;
}>;

export default function Home() {
  const [userData, setUser Data] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeUser  = async () => {
      try {
        if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
          const tg = window.Telegram.WebApp;
          tg.ready();
          tg.expand();

          const telegramUser  = tg.initDataUnsafe.user;
          if (!telegramUser ) {
            console.error('No Telegram user data available');
            setLoading(false);
            return;
          }

          const response = await fetch(`/api/user?telegramId=${telegramUser .id}`);
          if (response.ok) {
            const data = await response.json();
            setUser Data(data);
          } else if (response.status === 404) {
            // User not found, create a new user
            const newUser Response = await fetch('/api/user', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                telegramId: telegramUser .id,
                username: telegramUser .username || `user${telegramUser .id}`,
                firstName: telegramUser .first_name,
                lastName: telegramUser .last_name,
                profilePhoto: telegramUser .photo_url || '',
              }),
            });

            if (newUser Response.ok) {
              const newUser  = await newUser Response.json();
              setUser Data(newUser );
            } else {
              console.error('Failed to create new user:', await newUser Response.text());
            }
          } else {
            console.error('Failed to fetch user data:', await response.text());
          }
        } else {
          console.error('Telegram Web App is not available');
        }
      } catch (error) {
        console.error('Error initializing user:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeUser ();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <CryptoGame userData={userData} onCoinsUpdate={async (amount) => { /* handle coin update */ }} />;
}
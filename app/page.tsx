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
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const tg = window.Telegram?.WebApp;
        if (!tg?.initDataUnsafe?.user) {
          console.error('No Telegram user data available');
          setLoading(false);
          return;
        }

        const telegramUser = tg.initDataUnsafe.user;
        const response = await fetch(`/api/user?telegramId=${telegramUser.id}`);

        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else if (response.status === 404) {
          const newUserResponse = await fetch('/api/user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              telegramId: telegramUser.id,
              username: telegramUser.username || `user${telegramUser.id}`,
              firstName: telegramUser.first_name,
              lastName: telegramUser.last_name,
              profilePhoto: telegramUser.photo_url || '',
            }),
          });

          if (newUserResponse.ok) {
            const newUser = await newUserResponse.json();
            setUserData(newUser);
          } else {
            console.error('Failed to create new user');
          }
        } else {
          console.error('Failed to fetch user data');
        }
      } catch (error) {
        console.error('Error initializing user:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, []);

  const handleCoinsUpdate = async (amount: number) => {
    if (!userData) return;

    try {
      const response = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId: userData.telegramId,
          coins: userData.coins + amount,
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUserData(updatedUser);
      } else {
        console.error('Failed to update coins');
      }
    } catch (error) {
      console.error('Error updating coins:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <main>
      <CryptoGame userData={userData} onCoinsUpdate={handleCoinsUpdate} />
    </main>
  );
}

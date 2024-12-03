'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { User } from '@/types/user';

const CryptoGame = dynamic(() => import('@/components/crypto-game'), {
  ssr: false,
  loading: () => <div>Loading game...</div>,
}) as React.ComponentType<{
  userData: User | null;
  onCoinsUpdate: (amount: number) => Promise<void>;
}>;

export default function Home() {
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
          const tg = window.Telegram.WebApp;
          tg.ready();
          tg.expand();

          const telegramUser = tg.initDataUnsafe.user;
          if (!telegramUser) {
            throw new Error('No Telegram user data available');
          }

          console.log('Telegram user data:', telegramUser);

          const response = await fetch(`/api/user?telegramId=${telegramUser.id}`);
          console.log('Fetch response status:', response.status);

          if (response.ok) {
            const data = await response.json();
            console.log('Fetched user data:', data);
            setUserData(data);
          } else if (response.status === 404) {
            // User not found, create a new user
            const newUserResponse = await fetch('/api/user', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                telegramId: telegramUser.id,
                username: telegramUser.username || `user${telegramUser.id}`,
                profilePhoto: telegramUser.photo_url || '',
              }),
            });

            if (newUserResponse.ok) {
              const newUser = await newUserResponse.json();
              console.log('Created new user:', newUser);
              setUserData(newUser);
            } else {
              throw new Error('Failed to create new user');
            }
          } else {
            throw new Error('Failed to fetch user data');
          }
        } else {
          throw new Error('Telegram WebApp not available');
        }
      } catch (error) {
        console.error('Error initializing user:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
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
        throw new Error('Failed to update coins');
      }
    } catch (error) {
      console.error('Error updating coins:', error);
      setError(error instanceof Error ? error.message : 'Failed to update coins');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">Error: {error}</div>
    );
  }

  return (
    <main className="min-h-screen">
      {userData ? (
        <CryptoGame userData={userData} onCoinsUpdate={handleCoinsUpdate} />
      ) : (
        <div className="flex items-center justify-center h-screen">
          Failed to load user data. Please try again.
        </div>
      )}
    </main>
  );
}

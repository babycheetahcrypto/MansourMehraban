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
        // Get Telegram WebApp data
        const tg = window.Telegram?.WebApp;
        if (!tg?.initDataUnsafe?.user) {
          console.error('No Telegram user data available');
          setLoading(false);
          return;
        }

        const telegramUser = tg.initDataUnsafe.user;

        // Try to fetch existing user
        const response = await fetch(`/api/user?telegramId=${telegramUser.id}`);

        if (response.ok) {
          const data = await response.json();
          setUserData({
            ...data,
            lastUpdated: new Date(data.lastUpdated),
            name: data.username || `user${telegramUser.id}`,
            profilePhoto: telegramUser.photo_url || '',
          });
        } else if (response.status === 404) {
          // Create new user if not found
          const newUserResponse = await fetch('/api/user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              telegramId: telegramUser.id,
              username: telegramUser.username || `user${telegramUser.id}`,
              firstName: telegramUser.first_name,
              lastName: telegramUser.last_name,
              coins: 0,
              profilePhoto: telegramUser.photo_url || '',
            }),
          });

          if (newUserResponse.ok) {
            const newUser = await newUserResponse.json();
            setUserData({
              ...newUser,
              lastUpdated: new Date(newUser.lastUpdated),
              name: newUser.username || `user${telegramUser.id}`,
              profilePhoto: telegramUser.photo_url || '',
            });
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
      const updatedCoins = userData.coins + amount;
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...userData,
          coins: updatedCoins,
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUserData({
          ...updatedUser,
          lastUpdated: new Date(updatedUser.lastUpdated),
          name: updatedUser.username || userData.name,
          profilePhoto: updatedUser.profilePhoto || userData.profilePhoto,
        });
      } else {
        console.error('Failed to update coins');
      }
    } catch (error) {
      console.error('Error updating coins:', error);
    }
  };

  return (
    <main>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <CryptoGame userData={userData} onCoinsUpdate={handleCoinsUpdate} />
      )}
    </main>
  );
}

'use client';
import { useEffect, useState } from 'react';
import { UserData } from '@/types';
import CryptoGame from '@/components/crypto-game';

export default function Home() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Get Telegram WebApp data
        const tg = window.Telegram?.WebApp;
        if (!tg?.initDataUnsafe?.user) {
          console.error('No Telegram user data available');
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
            }),
          });

          if (newUserResponse.ok) {
            const newUser = await newUserResponse.json();
            setUserData({
              ...newUser,
              lastUpdated: new Date(newUser.lastUpdated),
            });
          }
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
        });
      }
    } catch (error) {
      console.error('Error updating coins:', error);
    }
  };

  return (
    <main>
      <CryptoGame userData={userData} onCoinsUpdate={handleCoinsUpdate} />
    </main>
  );
}

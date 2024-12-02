'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { User } from '@/types/user';

const CryptoGame = dynamic(() => import('@/components/crypto-game'), {
  ssr: false,
}) as React.ComponentType<{
  initialUserData: User | null;
  onCoinsUpdate: (amount: number) => Promise<void>;
}>;

export default function Page() {
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeUser = async () => {
      if (window.Telegram?.WebApp) {
        const webApp = window.Telegram.WebApp;
        webApp.ready();
        webApp.expand();

        try {
          setIsLoading(true);
          const telegramUser = webApp.initDataUnsafe.user;
          if (!telegramUser) {
            setIsLoading(false);
            return;
          }

          // First register the user
          const registerResponse = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user: {
                telegramId: telegramUser.id,
                username: telegramUser.username || `user${telegramUser.id}`,
                firstName: telegramUser.first_name,
                lastName: telegramUser.last_name,
              },
            }),
          });

          if (!registerResponse.ok) {
            throw new Error('Failed to register user');
          }

          // Then fetch user data
          const userDataResponse = await fetch('/api/user', {
            headers: {
              'x-telegram-id': telegramUser.id.toString(),
            },
          });

          if (!userDataResponse.ok) {
            throw new Error('Failed to fetch user data');
          }

          const userData = await userDataResponse.json();
          setUserData(userData);
        } catch (error) {
          console.error('Error initializing user:', error);
        } finally {
          setIsLoading(false);
        }
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
        setUserData(updatedUser);
      } else {
        console.error('Failed to update coins');
      }
    } catch (error) {
      console.error('Error updating coins:', error);
    }
  };

  return <CryptoGame initialUserData={userData} onCoinsUpdate={handleCoinsUpdate} />;
}

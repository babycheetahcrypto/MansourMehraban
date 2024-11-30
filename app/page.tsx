'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { UserData } from '@/types/index';

const CryptoGame = dynamic(() => import('@/components/crypto-game'), {
  ssr: false,
});

export default function Page() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeUser = async () => {
      if (window.Telegram?.WebApp) {
        const webApp = window.Telegram.WebApp;
        webApp.ready();
        webApp.expand();

        try {
          const telegramUser = webApp.initDataUnsafe.user;
          if (!telegramUser) {
            console.error('No Telegram user data available');
            return;
          }

          // Register the user
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
                coins: 0, // Set default coins for new user
                lastUpdated: new Date(), // Set current date as lastUpdated
              },
            }),
          });

          if (!registerResponse.ok) {
            throw new Error('Failed to register user');
          }

          // Fetch user data
          const userDataResponse = await fetch(`/api/user?telegramId=${telegramUser.id}`);
          if (!userDataResponse.ok) {
            throw new Error('Failed to fetch user data');
          }

          const userData = await userDataResponse.json();
          setUserData(userData);
        } catch (error) {
          console.error('Error initializing user:', error);
          // Handle error (e.g., show error message to user)
        } finally {
          setIsLoading(false);
        }
      } else {
        console.error('Telegram WebApp is not available');
        setIsLoading(false);
      }
    };

    initializeUser();
  }, []);

  const handleCoinsUpdate = async (amount: number) => {
    if (userData) {
      const updatedCoins = userData.coins + amount;
      setUserData({ ...userData, coins: updatedCoins });

      try {
        await fetch('/api/user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            telegramId: userData.telegramId,
            coins: updatedCoins,
          }),
        });
      } catch (error) {
        console.error('Error updating coins:', error);
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!userData) {
    return <div>Error: Unable to load user data</div>;
  }

  return <CryptoGame userData={userData} onCoinsUpdate={handleCoinsUpdate} />;
}

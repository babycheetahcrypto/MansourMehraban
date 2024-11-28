'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const CryptoGame = dynamic(() => import('@/components/crypto-game'), {
  ssr: false,
});

export default function Page() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;
      webApp.ready();
      webApp.expand();

      const initializeUser = async () => {
        try {
          setIsLoading(true);
          const telegramUser = webApp.initDataUnsafe.user;
          if (!telegramUser) {
            setError('No Telegram user data found');
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
                coins: 0,
              },
            }),
          });

          if (!registerResponse.ok) {
            throw new Error('Failed to register user');
          }

          // Then fetch user data
          const userDataResponse = await fetch(`/api/user?telegramId=${telegramUser.id}`);
          if (!userDataResponse.ok) {
            throw new Error('Failed to fetch user data');
          }

          setIsLoading(false);
        } catch (error) {
          console.error('Error initializing user:', error);
          setError('Failed to initialize user');
          setIsLoading(false);
        }
      };

      initializeUser();
    } else {
      setError('Telegram WebApp not available');
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return <CryptoGame />;
}

'use client';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';

const CryptoGame = dynamic(() => import('@/components/crypto-game'), {
  ssr: false,
});

export default function Page() {
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;
      webApp.ready();
      webApp.expand();

      const fetchUser = async (): Promise<void> => {
        try {
          const telegramUser = webApp.initDataUnsafe?.user;

          if (telegramUser) {
            const response = await fetch('/api/auth/register', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                user: {
                  telegramId: telegramUser.id,
                  username: telegramUser.username || null,
                  firstName: telegramUser.first_name || null,
                  lastName: telegramUser.last_name || null,
                },
              }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              console.error('Failed to register user:', errorData);
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };

      fetchUser();
    }
  }, []);

  return <CryptoGame />;
}

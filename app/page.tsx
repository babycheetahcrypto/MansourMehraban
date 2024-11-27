'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Define TypeScript interfaces
interface TelegramUser {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  language_code?: string;
  photo_url?: string;
}

interface UserData {
  id: string;
  telegramId: number;
  username: string;
  firstName?: string;
  lastName?: string;
  coins: number;
  lastUpdated: Date;
}

// Define props interface for CryptoGame
interface CryptoGameProps {
  userData: UserData | null;
  onCoinsUpdate: (amount: number) => Promise<void>;
}

// Dynamically import the CryptoGame component with proper type
const CryptoGame = dynamic<CryptoGameProps>(() => import('@/components/crypto-game'), {
  ssr: false,
});

export default function Page() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeTelegram = async () => {
      try {
        if (window.Telegram?.WebApp) {
          const webApp = window.Telegram.WebApp;
          webApp.ready();
          webApp.expand();

          const tgUser = webApp.initDataUnsafe?.user;

          if (!tgUser) {
            throw new Error('No Telegram user data available');
          }

          // Create telegramUser object with required structure
          const telegramUser: TelegramUser = {
            id: tgUser.id,
            username: tgUser.username,
            first_name: tgUser.first_name,
            last_name: tgUser.last_name,
            language_code: tgUser.language_code,
            photo_url: tgUser.photo_url,
          };

          // Register or update user in database
          const response = await fetch('/api/auth/register', {
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

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to register user');
          }

          await fetchUserData(telegramUser.id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeTelegram();
  }, []);

  const fetchUserData = async (telegramId: number) => {
    try {
      const response = await fetch(`/api/user?telegramId=${telegramId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const data = await response.json();
      setUserData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user data');
      console.error('Error fetching user data:', err);
    }
  };

  const updateUserCoins = async (amount: number) => {
    try {
      const response = await fetch('/api/user/coins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegramId: userData?.telegramId,
          amount,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update coins');
      }

      const updatedData = await response.json();
      setUserData(updatedData);
    } catch (err) {
      console.error('Error updating coins:', err);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      {userData && (
        <div className="user-info">
          <h2>Welcome, {userData.username}!</h2>
          <p>Coins: {userData.coins}</p>
        </div>
      )}
      <CryptoGame userData={userData} onCoinsUpdate={updateUserCoins} />
    </div>
  );
}

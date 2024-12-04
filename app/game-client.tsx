'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { User } from '@/types/user';

const CryptoGame = dynamic(() => import('@/components/crypto-game'), {
  ssr: false,
}) as React.ComponentType<{
  userData: User | null;
  onCoinsUpdate: (amount: number) => Promise<void>;
}>;

interface GameClientProps {
  getUserData: (telegramId: string) => Promise<User | null>;
}

export default function GameClient({ getUserData }: GameClientProps) {
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
          const tg = window.Telegram.WebApp;
          const telegramUser = tg.initDataUnsafe.user;
          if (!telegramUser) {
            console.error('No Telegram user data available');
            setLoading(false);
            return;
          }

          console.log('Telegram user data:', telegramUser);

          try {
            const data = await getUserData(telegramUser.id.toString());
            if (data) {
              console.log('Fetched user data:', data);
              setUserData(data);
            } else {
              // User not found, create a new user
              const newUserResponse = await fetch('/api/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  telegramId: telegramUser.id.toString(),
                  username: telegramUser.username || `user${telegramUser.id}`,
                  firstName: telegramUser.first_name,
                  lastName: telegramUser.last_name,
                  profilePhoto: telegramUser.photo_url || '',
                }),
              });

              if (newUserResponse.ok) {
                const newUser = await newUserResponse.json();
                console.log('Created new user:', newUser);
                setUserData(newUser.user);
              } else {
                console.error('Failed to create new user:', await newUserResponse.text());
              }
            }
          } catch (error) {
            console.error('Failed to fetch or create user data:', error);
          }
        } else {
          console.error('Telegram WebApp not available');
        }
      } catch (error) {
        console.error('Error initializing user:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, [getUserData]);

  const handleCoinsUpdate = async (amount: number) => {
    if (!userData) return;

    try {
      const response = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId: userData.telegramId,
          coins: amount,
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUserData(updatedUser.user);
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

  return <CryptoGame userData={userData} onCoinsUpdate={handleCoinsUpdate} />;
}

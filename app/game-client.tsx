'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { User } from '@/types/user';

const CryptoGame = dynamic(() => import('@/components/crypto-game'), {
  ssr: false,
}) as React.ComponentType<{
  userData: User | null;
  onCoinsUpdate: (amount: number) => Promise<void>;
  saveUserData: (userData: Partial<User>) => Promise<void>;
}>;

export default function GameClient() {
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = useCallback(async () => {
    try {
      if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
        const webApp = window.Telegram.WebApp;
        const telegramUser = webApp.initDataUnsafe.user;
        console.log('Telegram user data:', telegramUser);

        if (telegramUser) {
          const response = await fetch(`/api/user?telegramId=${telegramUser.id}`);
          console.log('Fetch response status:', response.status);

          if (response.ok) {
            const userData = await response.json();
            console.log('Fetched user data:', userData);
            setUserData(userData);
          } else if (response.status === 404) {
            // User not found, create a new user
            const createResponse = await fetch('/api/user', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                telegramId: telegramUser.id.toString(),
                username: telegramUser.username || `user${telegramUser.id}`,
                firstName: telegramUser.first_name,
                lastName: telegramUser.last_name || '',
                profilePhoto: telegramUser.photo_url || '',
              }),
            });
            if (createResponse.ok) {
              const newUser = await createResponse.json();
              console.log('Created new user:', newUser);
              setUserData(newUser.user);
            } else {
              throw new Error('Failed to create new user');
            }
          } else {
            throw new Error('Failed to fetch user data');
          }
        } else {
          throw new Error('No Telegram user data available');
        }
      } else {
        throw new Error('Telegram WebApp not available');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveUserData = useCallback(
    async (updatedUserData: Partial<User>) => {
      if (!userData) return;
      try {
        const response = await fetch('/api/user', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            telegramId: userData.telegramId,
            ...updatedUserData,
          }),
        });
        if (response.ok) {
          const updatedUser = await response.json();
          setUserData(updatedUser.user);
          console.log('User data saved successfully:', updatedUser.user);
        } else {
          throw new Error('Failed to update user data');
        }
      } catch (error) {
        console.error('Error saving user data:', error);
      }
    },
    [userData]
  );

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleCoinsUpdate = async (amount: number) => {
    if (!userData) return;
    const updatedCoins = userData.coins + amount;
    await saveUserData({ coins: updatedCoins });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <CryptoGame userData={userData} onCoinsUpdate={handleCoinsUpdate} saveUserData={saveUserData} />
  );
}

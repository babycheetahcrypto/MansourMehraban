'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { User } from '@/types/user';
import { getUser, updateUser, createGameData } from '@/lib/db';

const CryptoGame = dynamic(() => import('@/components/crypto-game'), {
  ssr: false,
}) as React.ComponentType<{
  userData: User | null;
  onCoinsUpdate: (amount: number) => Promise<void>;
  saveUserData: (userData: Partial<User>) => Promise<void>;
}>;

export default function GameClient() {
  const [userData, setUserData] = useState<User | null>(null);

  const fetchUserData = useCallback(async () => {
    try {
      if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
        const webApp = window.Telegram.WebApp;
        const telegramUser = webApp.initDataUnsafe.user;
        console.log('Telegram user data:', telegramUser);

        if (telegramUser) {
          const user = await getUser(telegramUser.id.toString());
          
          if (user) {
            console.log('Fetched user data:', user);
            setUserData(user);
          } else {
            // User not found, create a new user
            const newUser: User = {
              id: telegramUser.id.toString(),
              telegramId: telegramUser.id.toString(),
              username: telegramUser.username || `user${telegramUser.id}`,
              firstName: telegramUser.first_name,
              lastName: telegramUser.last_name,
              coins: 0,
              level: 1,
              exp: 0,
              profilePhoto: telegramUser.photo_url || '',
              clickPower: 1,
              energy: 2000,
              multiplier: 1,
              profitPerHour: 0,
              boosterCredits: 1,
              unlockedLevels: [1],
              pphAccumulated: 0,
              selectedCoinImage: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Broke%20Cheetah-FBrjrv6G0CRgHFPjLh3I4l3RGMONVS.png',
              friendsCoins: {},
              shopItems: [],
              premiumShopItems: [],
              tasks: [],
              dailyReward: {
                lastClaimed: null,
                streak: 0,
                day: 1,
                completed: false,
              },
              multiplierEndTime: null,
              boosterCooldown: null,
              lastBoosterReset: null,
            };

            await updateUser(newUser.id, newUser);
            await createGameData(newUser.id, {
              userId: newUser.id,
              level: newUser.level,
              exp: newUser.exp,
              clickPower: newUser.clickPower,
              energy: newUser.energy,
              multiplier: newUser.multiplier,
              profitPerHour: newUser.profitPerHour,
              boosterCredits: newUser.boosterCredits,
              unlockedLevels: newUser.unlockedLevels,
              pphAccumulated: newUser.pphAccumulated,
              selectedCoinImage: newUser.selectedCoinImage,
              shopItems: newUser.shopItems,
              premiumShopItems: newUser.premiumShopItems,
              tasks: newUser.tasks,
              dailyReward: newUser.dailyReward,
              multiplierEndTime: newUser.multiplierEndTime,
              boosterCooldown: newUser.boosterCooldown,
              lastBoosterReset: newUser.lastBoosterReset,
            });

            console.log('Created new user:', newUser);
            setUserData(newUser);
          }
        } else {
          console.error('No Telegram user data available');
          throw new Error('No Telegram user data available');
        }
      } else {
        console.error('Telegram WebApp not available');
        throw new Error('Telegram WebApp not available');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.showAlert('Failed to load game data. Please try again.');
      }
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const saveUserData = useCallback(
    async (updatedUserData: Partial<User>) => {
      if (!userData) return;
      try {
        await updateUser(userData.id, updatedUserData);
        setUserData((prevUserData) => ({
          ...prevUserData!,
          ...updatedUserData,
        }));
        console.log('User data saved successfully:', updatedUserData);
      } catch (error) {
        console.error('Error saving user data:', error);
      }
    },
    [userData]
  );

  const handleCoinsUpdate = async (amount: number) => {
    if (!userData) return;
    const updatedCoins = userData.coins + amount;
    await saveUserData({ coins: updatedCoins });
  };

  return (
    <CryptoGame userData={userData} onCoinsUpdate={handleCoinsUpdate} saveUserData={saveUserData} />
  );
}


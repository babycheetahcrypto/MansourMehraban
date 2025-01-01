'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { User } from '@/types/user';
import { db } from '@/firebaseConfig';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

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
          const userDocRef = doc(db, 'users', telegramUser.id.toString());
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            console.log('Fetched user data:', userData);
            setUserData(userData);
          } else {
            // User not found, create a new user
            const newUser: User = {
              id: telegramUser.id.toString(),
              telegramId: telegramUser.id.toString(),
              username: telegramUser.username || `user${telegramUser.id}`,
              firstName: telegramUser.first_name,
              lastName: telegramUser.last_name,
              profilePhoto: telegramUser.photo_url || '',
              coins: 0,
              level: 1,
              exp: 0,
              shopItems: [],
              premiumShopItems: [],
              tasks: [],
              dailyReward: {
                lastClaimed: null,
                streak: 0,
                day: 1,
                completed: false,
              },
              unlockedLevels: [1],
              clickPower: 1,
              friendsCoins: {},
              energy: 2000,
              pphAccumulated: 0,
              multiplier: 1,
              multiplierEndTime: null,
              boosterCooldown: null,
              selectedCoinImage: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Broke%20Cheetah-FBrjrv6G0CRgHFPjLh3I4l3RGMONVS.png',
              profitPerHour: 0,
              boosterCredits: 1,
              lastBoosterReset: null,
            };
            await setDoc(userDocRef, newUser);
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
        const userDocRef = doc(db, 'users', userData.telegramId);
        await updateDoc(userDocRef, updatedUserData);
        setUserData((prevUserData) => ({ ...prevUserData!, ...updatedUserData }));
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
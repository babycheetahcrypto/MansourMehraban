'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { User } from '@/types/user';
import { GameData } from '@/types/game-data';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

const CryptoGame = dynamic(() => import('@/components/crypto-game'), {
  ssr: false,
}) as React.ComponentType<{
  userData: User | null;
  onCoinsUpdate: (amount: number) => Promise<void>;
  saveUserData: (userData: Partial<User>) => Promise<void>;
}>;

export default function GameClient() {
  const [userData, setUserData] = useState<User | null>(null);

  const fetchUserData = useCallback(async (userId: string) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const user = userDoc.data() as User;
        setUserData(user);

        // Set up real-time listener for user data
        onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            setUserData(doc.data() as User);
          }
        });

        // Fetch game data
        const gameDataRef = doc(db, 'gameData', userId);
        const gameDataDoc = await getDoc(gameDataRef);

        if (gameDataDoc.exists()) {
          const gameData = gameDataDoc.data() as GameData;
          setUserData(prevUser => ({
            ...prevUser!,
            ...gameData
          }));

          // Set up real-time listener for game data
          onSnapshot(gameDataRef, (doc) => {
            if (doc.exists()) {
              setUserData(prevUser => ({
                ...prevUser!,
                ...doc.data() as GameData
              }));
            }
          });
        }
      } else {
        console.error('User not found');
        throw new Error('User not found');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
      const webApp = window.Telegram.WebApp;
      webApp.ready();
      webApp.expand();

      const telegramUser = webApp.initDataUnsafe.user;
      const startParam = webApp.initDataUnsafe.start_param;
      console.log('Telegram user data:', telegramUser);
      console.log('Start param:', startParam);

      if (telegramUser) {
        fetchUserData(telegramUser.id.toString()).catch(error => {
          console.error('Failed to load game data:', error);
          if (window.Telegram && window.Telegram.WebApp) {
            window.Telegram.WebApp.showAlert('Failed to load game data. Please try again.');
          }
        });
      } else {
        console.error('No Telegram user data available');
        if (window.Telegram && window.Telegram.WebApp) {
          window.Telegram.WebApp.showAlert('Failed to load user data. Please try again.');
        }
      }
    } else {
      console.error('Telegram WebApp not available');
    }
  }, [fetchUserData]);

  const saveUserData = useCallback(
    async (updatedUserData: Partial<User>) => {
      if (!userData) return;
      try {
        const userRef = doc(db, 'users', userData.id);
        await setDoc(userRef, updatedUserData, { merge: true });

        const gameDataRef = doc(db, 'gameData', userData.id);
        await setDoc(gameDataRef, updatedUserData, { merge: true });

        console.log('User and game data saved successfully:', updatedUserData);
      } catch (error) {
        console.error('Error saving user and game data:', error);
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


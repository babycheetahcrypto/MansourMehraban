import { db } from '@/lib/firebase';
import { doc, updateDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import type { User } from '@/types/user';

export const saveUserToFirestore = async (user: Partial<User>) => {
  if (!user.id) return;
  
  const userRef = doc(db, 'users', user.id);
  try {
    await updateDoc(userRef, {
      ...user,
      lastUpdated: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error saving user data:', error);
    throw error;
  }
};

export const setupUserListener = (userId: string, onUpdate: (user: User) => void) => {
  const userRef = doc(db, 'users', userId);
  
  return onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      onUpdate(doc.data() as User);
    }
  });
};

export const updateUserCoins = async (userId: string, newCoins: number) => {
  const userRef = doc(db, 'users', userId);
  try {
    await updateDoc(userRef, {
      coins: newCoins,
      lastUpdated: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating coins:', error);
    throw error;
  }
};

export const updateUserProgress = async (
  userId: string,
  updates: Partial<User>
) => {
  const userRef = doc(db, 'users', userId);
  try {
    await updateDoc(userRef, {
      ...updates,
      lastUpdated: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating user progress:', error);
    throw error;
  }
};


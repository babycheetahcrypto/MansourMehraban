import { PrismaClient } from '@prisma/client';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export async function connectWithRetry() {
  let currentTry = 0;

  while (currentTry < MAX_RETRIES) {
    try {
      const prisma = new PrismaClient();
      await prisma.$connect();
      return prisma;
    } catch (error) {
      currentTry++;
      console.error(`Database connection attempt ${currentTry} failed:`, error);
      if (currentTry === MAX_RETRIES) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
    }
  }
}

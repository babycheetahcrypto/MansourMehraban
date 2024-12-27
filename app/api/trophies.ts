import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const updateTrophy = async (userId: string, trophyId: string, data: any) => {
  try {
    const updatedTrophy = await prisma.trophy.update({
      data,
      where: {
        id: trophyId,
        userId: userId,
      },
    });
    return updatedTrophy;
  } catch (error) {
    console.error("Error updating trophy:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

export const getTrophy = async (userId: string, trophyId: string) => {
  try {
    const trophy = await prisma.trophy.findUnique({
      where: {
        id: trophyId,
        userId: userId,
      },
    });
    return trophy;
  } catch (error) {
    console.error("Error getting trophy:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};


import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient();
  }
  prisma = (global as any).prisma;
}

export default prisma;

export async function testPrismaConnection() {
  try {
    await prisma.$connect();
    console.log('Successfully connected to the database via Prisma');
    await prisma.$disconnect();
  } catch (error) {
    console.error('Failed to connect to the database via Prisma:', error);
    throw error;
  }
}

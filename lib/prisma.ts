import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma =
  global.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

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

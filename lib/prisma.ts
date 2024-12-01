import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
declare global {
  var prisma: PrismaClient | undefined;
}

// Create a singleton instance of Prisma Client
const prisma = global.prisma || new PrismaClient();

// In development, attach prisma to the global object to prevent multiple instances
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;

import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma =
  global.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

// Test database connection
prisma
  .$connect()
  .then(() => console.log('Successfully connected to the database'))
  .catch((e) => console.error('Failed to connect to the database', e));

console.log('Database URL:', process.env.DATABASE_URL);

export default prisma;

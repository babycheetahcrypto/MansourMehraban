import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient()
  }
  prisma = global.prisma
}

export default prisma

export async function connectToDatabase() {
  try {
    await prisma.$connect()
    console.log('Successfully connected to the database')
  } catch (error) {
    console.error('Failed to connect to the database:', error)
    throw new Error('Database connection failed')
  }
}

export async function disconnectFromDatabase() {
  try {
    await prisma.$disconnect()
    console.log('Successfully disconnected from the database')
  } catch (error) {
    console.error('Failed to disconnect from the database:', error)
  }
}


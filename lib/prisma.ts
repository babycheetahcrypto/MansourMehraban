import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  console.log('Initializing Prisma client in production mode');
  prisma = new PrismaClient()
} else {
  console.log('Initializing Prisma client in development mode');
  if (!global.prisma) {
    console.log('Creating new Prisma client instance');
    global.prisma = new PrismaClient()
  } else {
    console.log('Reusing existing Prisma client instance');
  }
  prisma = global.prisma
}

prisma.$use(async (params, next) => {
  const before = Date.now()
  const result = await next(params)
  const after = Date.now()
  console.log(`Query ${params.model}.${params.action} took ${after - before}ms`)
  return result
})

export default prisma


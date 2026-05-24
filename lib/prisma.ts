import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma_new: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma_new ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma_new = prisma;

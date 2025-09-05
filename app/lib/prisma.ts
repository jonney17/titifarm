import { PrismaClient } from "@prisma/client";

type GlobalThisWithPrisma = typeof globalThis & { prismaGlobal?: PrismaClient };
const g = globalThis as GlobalThisWithPrisma;

export const prisma: PrismaClient = g.prismaGlobal ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  g.prismaGlobal = prisma;
}



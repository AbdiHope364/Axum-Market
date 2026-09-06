import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';
import path from 'node:path';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function resolveDbPath(): string {
  // First, search upwards from process.cwd() for the canonical repo database: packages/database/prisma/dev.db
  let curr = process.cwd();
  for (let i = 0; i < 6; i++) {
    const canonical = path.join(curr, 'packages/database/prisma/dev.db');
    if (fs.existsSync(canonical)) {
      return canonical;
    }
    const parent = path.dirname(curr);
    if (parent === curr) break;
    curr = parent;
  }

  // Second, check DATABASE_URL if explicitly pointing to an existing file
  if (process.env.DATABASE_URL?.startsWith('file:')) {
    const rawPath = process.env.DATABASE_URL.replace('file:', '');
    if (fs.existsSync(rawPath)) {
      return path.resolve(rawPath);
    }
  }

  // Fallback: check prisma/dev.db in parent chain
  curr = process.cwd();
  for (let i = 0; i < 6; i++) {
    const candidate = path.join(curr, 'prisma/dev.db');
    if (fs.existsSync(candidate)) {
      return candidate;
    }
    const parent = path.dirname(curr);
    if (parent === curr) break;
    curr = parent;
  }

  return path.join(process.cwd(), 'dev.db');
}

const resolvedDbUrl =
  process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('file:')
    ? process.env.DATABASE_URL
    : `file:${resolveDbPath()}`;

export const prisma =
  globalThis.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: resolvedDbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export * from '@prisma/client';

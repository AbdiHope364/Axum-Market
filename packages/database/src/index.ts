import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';
import path from 'node:path';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function resolveDbPath(): string {
  // First, check explicit DATABASE_URL if pointing to an existing file
  if (process.env.DATABASE_URL?.startsWith('file:')) {
    const rawPath = process.env.DATABASE_URL.replace('file:', '');
    if (fs.existsSync(rawPath)) {
      return path.resolve(rawPath);
    }
  }

  // Find canonical database file in the repository
  let sourceDbPath: string | null = null;
  let curr = process.cwd();
  for (let i = 0; i < 6; i++) {
    const candidates = [
      path.join(curr, 'packages/database/prisma/dev.db'),
      path.join(curr, 'prisma/dev.db'),
      path.join(curr, 'dev.db'),
    ];
    for (const cand of candidates) {
      if (fs.existsSync(cand)) {
        sourceDbPath = cand;
        break;
      }
    }
    if (sourceDbPath) break;
    const parent = path.dirname(curr);
    if (parent === curr) break;
    curr = parent;
  }

  // If in Vercel or AWS Lambda, copy database to /tmp for read/write access
  const isServerless = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
  if (isServerless) {
    const tmpDbPath = path.join('/tmp', 'axum_dev.db');
    if (sourceDbPath && fs.existsSync(sourceDbPath)) {
      try {
        if (!fs.existsSync(tmpDbPath) || fs.statSync(tmpDbPath).size === 0) {
          fs.copyFileSync(sourceDbPath, tmpDbPath);
        }
      } catch (err) {
        console.warn('Failed to copy db to /tmp:', err);
      }
      return tmpDbPath;
    }
    return tmpDbPath;
  }

  if (sourceDbPath) {
    return sourceDbPath;
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

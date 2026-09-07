import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';
import path from 'node:path';
import { restoreEmbeddedDatabase } from './embedded-db';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function resolveDbPath(): string {
  // First, check explicit DATABASE_URL if pointing to an existing file
  if (process.env.DATABASE_URL?.startsWith('file:')) {
    const rawPath = process.env.DATABASE_URL.replace('file:', '');
    if (fs.existsSync(rawPath) && fs.statSync(rawPath).size >= 50000) {
      return path.resolve(rawPath);
    }
  }

  const isServerless = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
  const tmpDbPath = path.join('/tmp', 'axum_dev.db');

  // If in serverless and valid tmpDb already exists with data, use it directly
  if (isServerless && fs.existsSync(tmpDbPath) && fs.statSync(tmpDbPath).size >= 50000) {
    return tmpDbPath;
  }

  // Search canonical database files in the repository
  let sourceDbPath: string | null = null;
  let curr = process.cwd();
  for (let i = 0; i < 6; i++) {
    const candidates = [
      path.join(curr, 'packages/database/prisma/dev.db'),
      path.join(curr, 'apps/web/prisma/dev.db'),
      path.join(curr, 'apps/admin/prisma/dev.db'),
      path.join(curr, 'prisma/dev.db'),
      path.join(curr, 'dev.db'),
    ];
    for (const cand of candidates) {
      if (fs.existsSync(cand) && fs.statSync(cand).size >= 50000) {
        sourceDbPath = cand;
        break;
      }
    }
    if (sourceDbPath) break;
    const parent = path.dirname(curr);
    if (parent === curr) break;
    curr = parent;
  }

  // Also check relative to directory structure
  if (!sourceDbPath) {
    const dirCandidates = [
      path.join(__dirname, 'dev.db'),
      path.join(__dirname, '../dev.db'),
      path.join(__dirname, '../../dev.db'),
      path.join(__dirname, '../../../dev.db'),
      path.join(__dirname, '../../../../dev.db'),
      path.join(__dirname, '../prisma/dev.db'),
      path.join(__dirname, '../../prisma/dev.db'),
      path.join(__dirname, '../../../../packages/database/prisma/dev.db'),
    ];
    for (const cand of dirCandidates) {
      if (fs.existsSync(cand) && fs.statSync(cand).size >= 50000) {
        sourceDbPath = cand;
        break;
      }
    }
  }

  // Serverless mode (Vercel / Lambda): writable /tmp required
  if (isServerless) {
    if (sourceDbPath && fs.existsSync(sourceDbPath)) {
      try {
        fs.copyFileSync(sourceDbPath, tmpDbPath);
        return tmpDbPath;
      } catch (err) {
        console.warn('Failed to copy db to /tmp, falling back to embedded snapshot:', err);
      }
    }
    // Reliable fallback: restore from embedded snapshot
    restoreEmbeddedDatabase(tmpDbPath);
    return tmpDbPath;
  }

  // Local/container mode:
  if (sourceDbPath) {
    return sourceDbPath;
  }

  // Default local fallback: restore embedded snapshot to cwd dev.db
  const defaultLocalDb = path.join(process.cwd(), 'dev.db');
  restoreEmbeddedDatabase(defaultLocalDb);
  return defaultLocalDb;
}

function createPrismaClient(): PrismaClient {
  const dbUrl =
    process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('file:')
      ? process.env.DATABASE_URL
      : `file:${resolveDbPath()}`;

  return new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

function getSafePrisma(): PrismaClient {
  if (globalThis.prisma) return globalThis.prisma;
  try {
    const client = createPrismaClient();
    if (process.env.NODE_ENV !== 'production') {
      globalThis.prisma = client;
    }
    return client;
  } catch (err) {
    console.error('Failed to initialize Prisma Client:', err);
    return new Proxy({} as PrismaClient, {
      get(_target, prop) {
        if (typeof prop === 'string' && prop.startsWith('$')) {
          return () => Promise.reject(new Error(`Prisma unavailable: ${String(err)}`));
        }
        return new Proxy({}, {
          get() {
            return () => Promise.reject(new Error(`Prisma unavailable: ${String(err)}`));
          },
        });
      },
    });
  }
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getSafePrisma();
    const val = Reflect.get(client as any, prop, receiver);
    if (typeof val === 'function') {
      return val.bind(client);
    }
    return val;
  },
});

export * from '@prisma/client';
export { resolveDbPath, restoreEmbeddedDatabase };

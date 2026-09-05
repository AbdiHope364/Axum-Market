import path from 'node:path';

export default {
  schema: 'packages/database/prisma/schema.prisma',
  datasources: {
    db: {
      url: process.env.DATABASE_URL || `file:${path.resolve(__dirname, 'packages/database/prisma/dev.db')}`,
    },
  },
};


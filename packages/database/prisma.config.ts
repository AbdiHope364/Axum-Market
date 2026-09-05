import path from 'node:path';

export default {
  schema: 'prisma/schema.prisma',
  datasources: {
    db: {
      url: process.env.DATABASE_URL || `file:${path.resolve(__dirname, 'prisma/dev.db')}`,
    },
  },
};


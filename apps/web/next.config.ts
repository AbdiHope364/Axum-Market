import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ['@axum/database'],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  outputFileTracingIncludes: {
    '/**': [
      '../../packages/database/prisma/dev.db',
      '../../node_modules/.prisma/client/**/*',
      './prisma/dev.db',
      './dev.db',
    ],
  },
};

export default nextConfig;

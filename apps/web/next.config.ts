import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
};

export default nextConfig;

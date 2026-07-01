import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only use the standalone server bundle for our own Docker/Cloud Run build.
  // Vercel manages its own packaging and this setting breaks its routing
  // detection (build succeeds but every route 404s at runtime), so it must
  // stay OFF for Vercel deployments.
  output: process.env.DOCKER_BUILD === '1' ? 'standalone' : undefined,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/:path*`,
      },
    ];
  },
};

export default nextConfig;

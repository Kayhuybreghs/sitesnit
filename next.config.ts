import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep metadata in the initial HTML head for every visitor.
  htmlLimitedBots: /.*/,
  poweredByHeader: false,
  outputFileTracingRoot: process.cwd(),
  serverExternalPackages: ['@neondatabase/serverless'],
  experimental: { cpus: 1, webpackMemoryOptimizations: true },
  async headers() {
    return [{source:'/:path*',headers:[
      {key:'X-Content-Type-Options',value:'nosniff'},
      {key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},
      {key:'X-Frame-Options',value:'SAMEORIGIN'},
      {key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=()'},
    ]}];
  },
};

export default nextConfig;

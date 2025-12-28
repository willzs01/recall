import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  // Fix workspace root detection
  outputFileTracingRoot: __dirname,
  // Skip TypeScript errors during build (temporary fix for minimatch type issue)
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    // Empty config
  },
};

const pwaConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

export default pwaConfig(nextConfig);

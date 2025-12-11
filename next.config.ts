import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Explicitly disable Turbopack to avoid runtime errors
  experimental: {
    turbo: false,
  },
};

export default nextConfig;

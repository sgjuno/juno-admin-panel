import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    domains: ['github.com'], // Add any other domains you need for images
  },
};

export default nextConfig;

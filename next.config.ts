import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.devtunnels.ms',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '8000',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
      {
        protocol: 'https',
        hostname: '127.0.0.1',
      },
      {
        protocol: 'https',
        hostname: 'solsbackend.cortechsocial.com',
      },
      {
        protocol: 'http',
        hostname: '192.168.18.199',
      },
    ],
    domains: [
      "127.0.0.1", 
      "localhost",
      "marlin-welcome-goat.ngrok-free.app",
      "*.devtunnels.ms",
      "solsbackend.cortechsocial.com",
      "192.168.18.199"
    ],
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    authInterrupts: true,
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3004",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "**", // Cho phép mọi domain HTTPS (có thể giới hạn sau)
      },
    ],
  },
};

export default nextConfig;

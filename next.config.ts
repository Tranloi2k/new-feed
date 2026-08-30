import type { NextConfig } from "next";

const gatewayUrl =
  process.env.API_GATEWAY_URL?.replace(/\/$/, "") || "http://localhost:8080";

const nextConfig: NextConfig = {
  // Socket.IO uses a trailing slash by default; redirecting it drops the
  // WebSocket upgrade before rewrites can proxy the connection.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    // Do NOT proxy /api/auth/session|csrf|providers|... — those are NextAuth (App Router).
    return [
      { source: "/api/auth/login", destination: `${gatewayUrl}/api/auth/login` },
      { source: "/api/auth/signup", destination: `${gatewayUrl}/api/auth/signup` },
      { source: "/api/auth/logout", destination: `${gatewayUrl}/api/auth/logout` },
      { source: "/api/auth/me", destination: `${gatewayUrl}/api/auth/me` },
      {
        source: "/api/auth/reset-password",
        destination: `${gatewayUrl}/api/auth/reset-password`,
      },
      {
        source: "/api/users/:id/profile",
        destination: `${gatewayUrl}/api/users/:id/profile`,
      },
      { source: "/api/users/:path*", destination: `${gatewayUrl}/api/users/:path*` },
      {
        source: "/api/notifications/:path*",
        destination: `${gatewayUrl}/api/notifications/:path*`,
      },
      { source: "/api/chat/:path*", destination: `${gatewayUrl}/api/chat/:path*` },
      {
        source: "/chat/socket.io/",
        destination: `${gatewayUrl}/chat/socket.io/`,
      },
      {
        source: "/chat/socket.io/:path+",
        destination: `${gatewayUrl}/chat/socket.io/:path+`,
      },
      { source: "/api/media/:path*", destination: `${gatewayUrl}/api/media/:path*` },
      { source: "/graphql/post", destination: `${gatewayUrl}/graphql/post` },
      {
        source: "/graphql/comment",
        destination: `${gatewayUrl}/graphql/comment`,
      },
    ];
  },
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

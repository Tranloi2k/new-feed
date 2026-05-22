import type { NextAuthConfig } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    expiresAt?: number;
    nearExpiry?: boolean;
  }
}

const SESSION_MAX_AGE = 7 * 24 * 60 * 60;

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE,
    updateAge: 12 * 60 * 60,
  },
  jwt: {
    maxAge: SESSION_MAX_AGE,
  },
  secret: process.env.AUTH_SECRET,
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/home");
      const isAuthPage =
        nextUrl.pathname === "/login" || nextUrl.pathname === "/signup";

      if (isOnDashboard) {
        return isLoggedIn;
      }

      if (isLoggedIn && isAuthPage) {
        return Response.redirect(new URL("/home", nextUrl));
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user?.id) {
        return {
          ...token,
          id: user.id,
          email: user.email,
          name: user.name,
          expiresAt: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
        };
      }

      if (
        typeof token.expiresAt === "number" &&
        Date.now() / 1000 > token.expiresAt
      ) {
        return null;
      }

      return token;
    },

    async session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = String(token.id);
      }
      if (token.email && session.user) {
        session.user.email = token.email as string;
      }
      if (token.name && session.user) {
        session.user.name = token.name as string;
      }

      if (token) {
        session.expiresAt =
          typeof token.expiresAt === "number" ? token.expiresAt : undefined;

        if (typeof token.expiresAt === "number") {
          const timeLeft = token.expiresAt - Math.floor(Date.now() / 1000);
          if (timeLeft < 24 * 60 * 60) {
            session.nearExpiry = true;
          }
        }
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;

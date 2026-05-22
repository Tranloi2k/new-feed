import NextAuth from "next-auth";
import { authConfig } from "./nextAuth.config";
import Credentials from "next-auth/providers/credentials";
import { login } from "./features/auth/lib/auth";

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) {
          return null;
        }

        try {
          const { data } = await login({ email, password });
          if (!data) {
            return null;
          }

          const userId = data.userId ?? data.id;
          if (userId == null) {
            return null;
          }

          return {
            id: String(userId),
            name: data.fullName || data.username,
            email: data.email,
          };
        } catch (error) {
          console.error("Login failed:", error);
          return null;
        }
      },
    }),
  ],
});

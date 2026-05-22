import NextAuth from "next-auth";
import { authConfig } from "./nextAuth.config";
import Credentials from "next-auth/providers/credentials";
import { cookies } from "next/headers";
import { login } from "./app/lib/services/auth";

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials as {
          email: string;
          password: string;
        };
        try {
          const response = await login({ email, password });

          const { data } = await response.json();
          // Parse cookies từ Set-Cookie headers
          const cookieStore = await cookies();
          const setCookieHeader = response.headers.get("set-cookie");

          if (setCookieHeader) {
            // Parse multiple cookies từ Set-Cookie header
            const cookies_arr = setCookieHeader.split(",").map((c) => c.trim());

            for (const cookieString of cookies_arr) {
              // Parse cookie: "name=value; HttpOnly; Path=/; ..."
              const parts = cookieString.split(";");
              const [nameValue] = parts;
              const [name, value] = nameValue.split("=");

              if (!name || !value) continue;

              // Parse attributes
              const opts: any = { path: "/" };

              for (const part of parts.slice(1)) {
                const trimmed = part.trim().toLowerCase();
                if (trimmed === "httponly") opts.httpOnly = true;
                if (trimmed === "secure") opts.secure = true;
                if (trimmed.startsWith("max-age=")) {
                  opts.maxAge = parseInt(trimmed.split("=")[1]);
                }
                if (trimmed.startsWith("samesite=")) {
                  opts.sameSite = trimmed.split("=")[1];
                }
                if (trimmed.startsWith("path=")) {
                  opts.path = trimmed.split("=")[1];
                }
              }

              cookieStore.set({
                name: name.trim(),
                value: value.trim(),
                ...opts,
              });
            }
          }

          cookieStore.set({
            name: "user_id",
            value: data.userId,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60,
            path: "/",
          });

          return { id: email, name: email };
        } catch (error) {
          console.error("Login failed:", error);
        }
        return null;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
  },
});

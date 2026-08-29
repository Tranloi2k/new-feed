import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ApolloWrapper } from "@/features/shared/lib/apollo/apollo-wrapper";
import { SessionProvider } from "./providers/SessionProvider";
import { SessionRefresh } from "@/features/auth/ui/SessionRefresh";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NewFeed — Mạng xã hội hiện đại",
  description: "Kết nối, chia sẻ và khám phá — trải nghiệm social 2026",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <SessionRefresh />
          <ApolloWrapper>{children}</ApolloWrapper>
        </SessionProvider>
      </body>
    </html>
  );
}

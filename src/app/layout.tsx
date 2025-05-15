import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import ClientLayoutWrapper from '@/components/ClientLayoutWrapper';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Juno Admin Panel",
  description: "Next.js Admin Panel with MongoDB",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.className)}>
        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>
      </body>
    </html>
  );
}

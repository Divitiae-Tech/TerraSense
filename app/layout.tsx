import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "./Providers/ConvexClientProvider";
import { UserProvider } from "./Providers/UserProvider";
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import "./globals.css";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TerraSense - For Farmers',
  description: 'Farm management system for modern agriculture',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <ConvexClientProvider>
        <UserProvider>
          <html lang="en">
            <body className={inter.className}>{children}</body>
          </html>
        </UserProvider>
      </ConvexClientProvider>
    </ClerkProvider>
  );
}
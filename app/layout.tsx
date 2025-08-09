<<<<<<< Updated upstream
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ConvexClientProvider } from "./ConvexClientProvider"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TerraSense - For Farmers',
  description: 'Farm management system for modern agriculture',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConvexClientProvider>
          {children}
        </ConvexClientProvider>
      </body>
    </html>
=======
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "./Providers/ConvexClientProvider";
import { UserProvider } from "./Providers/UserProvider";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <ConvexClientProvider>
        <UserProvider>
          <html lang="en">
            <body>{children}</body>
          </html>
        </UserProvider>
      </ConvexClientProvider>
    </ClerkProvider>
>>>>>>> Stashed changes
  );
}
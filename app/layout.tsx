
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
  );
}
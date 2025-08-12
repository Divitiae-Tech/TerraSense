
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "../Providers/ConvexClientProvider";
import { UserProvider } from "../Providers/UserProvider";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
<ClerkProvider>
      <ConvexClientProvider>
        <UserProvider>
          <html lang="en">
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </head>
            <body>{children}</body>
          </html>
        </UserProvider>
      </ConvexClientProvider>
    </ClerkProvider>
  );
}
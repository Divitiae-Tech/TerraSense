'use client';

import { useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user, isSignedIn } = useUser();
  const registerUser = useMutation(api.users.registerUser);
  const hasRegistered = useRef(false);

  useEffect(() => {
    const registerUserInDb = async () => {
      if (!isSignedIn || !user || hasRegistered.current) {
        return;
      }

      try {
        hasRegistered.current = true;
        console.log("Starting registration for:", {
          id: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          name: user.fullName
        });

        const userId = await registerUser({
          clerkId: user.id,
          email: user.primaryEmailAddress?.emailAddress || "",
          name: user.fullName || "",
          imageUrl: user.imageUrl || "",
          role: "farmer",
          createdAt: Date.now(),
        });

        console.log("Registration successful:", userId);
      } catch (error) {
        hasRegistered.current = false;
        console.error("Registration failed:", error);
      }
    };

    registerUserInDb();

    // Cleanup function
    return () => {
      hasRegistered.current = false;
    };
  }, [isSignedIn, user?.id]); // Only depend on isSignedIn and user.id

  return <>{children}</>;
}
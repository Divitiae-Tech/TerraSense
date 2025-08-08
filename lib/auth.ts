// lib/auth.ts
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";

export function useAuthenticatedUser() {
  const { user, isLoaded } = useUser();
  const createUser = useMutation(api.users.createUser);

  useEffect(() => {
    if (isLoaded && user) {
      // Create or update user in Convex
      createUser({
        name: user.fullName || user.username || "Unknown User",
        email: user.primaryEmailAddress?.emailAddress || "",
        role: "farmer", // Default role
      });
    }
  }, [isLoaded, user, createUser]);

  return {
    userId: user?.id,
    user,
    isLoaded,
  };
}
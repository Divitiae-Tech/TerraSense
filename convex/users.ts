import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const registerUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
    role: v.optional(v.union(v.literal("farmer"), v.literal("admin"), v.literal("buyer"))),
    location: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    farmSize: v.optional(v.number()),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    console.log("registerUser: Received args:", args); // Debug log

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      console.log("registerUser: User exists, updating:", existingUser); // Debug log
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        name: args.name,
        imageUrl: args.imageUrl,
        role: args.role,
        location: args.location,
        phoneNumber: args.phoneNumber,
        farmSize: args.farmSize,
        updatedAt: Date.now(),
      });
      return existingUser._id;
    }

    console.log("registerUser: Creating new user"); // Debug log
    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      imageUrl: args.imageUrl,
      role: args.role,
      location: args.location,
      phoneNumber: args.phoneNumber,
      farmSize: args.farmSize,
      createdAt: Date.now(),
    });

    console.log("registerUser: User created with ID:", userId); // Debug log
    return userId;
  },
});

export const getUserByClerkId = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
    
    return user;
  },
});
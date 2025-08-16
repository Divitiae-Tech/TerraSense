import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new field with crop areas
export const createField = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    totalArea: v.number(), // in hectares
    location: v.object({
      latitude: v.number(),
      longitude: v.number(),
    }),
    boundaries: v.array(v.object({
      latitude: v.number(),
      longitude: v.number(),
    })),
    cropAreas: v.array(v.object({
      id: v.string(),
      name: v.string(),
      cropType: v.string(),
      area: v.number(), // in hectares
      coordinates: v.array(v.object({
        latitude: v.number(),
        longitude: v.number(),
      })),
      plantingDate: v.optional(v.string()),
      expectedHarvestDate: v.optional(v.string()),
      status: v.union(
        v.literal("planned"),
        v.literal("planted"),
        v.literal("growing"),
        v.literal("ready_to_harvest"),
        v.literal("harvested")
      ),
      notes: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("fields", {
      userId: args.userId,
      name: args.name,
      description: args.description,
      totalArea: args.totalArea,
      location: args.location,
      boundaries: args.boundaries,
      cropAreas: args.cropAreas,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Get all fields for a user
export const getUserFields = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("fields")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// Update a field
export const updateField = mutation({
  args: {
    userId: v.id("users"),
    fieldId: v.id("fields"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    totalArea: v.optional(v.number()),
    location: v.optional(v.object({
      latitude: v.number(),
      longitude: v.number(),
    })),
    boundaries: v.optional(v.array(v.object({
      latitude: v.number(),
      longitude: v.number(),
    }))),
    cropAreas: v.optional(v.array(v.object({
      id: v.string(),
      name: v.string(),
      cropType: v.string(),
      area: v.number(),
      coordinates: v.array(v.object({
        latitude: v.number(),
        longitude: v.number(),
      })),
      plantingDate: v.optional(v.string()),
      expectedHarvestDate: v.optional(v.string()),
      status: v.union(
        v.literal("planned"),
        v.literal("planted"),
        v.literal("growing"),
        v.literal("ready_to_harvest"),
        v.literal("harvested")
      ),
      notes: v.optional(v.string()),
    }))),
  },
  handler: async (ctx, args) => {
    const field = await ctx.db.get(args.fieldId);
    if (!field || field.userId !== args.userId) {
      throw new Error("Field not found or access denied");
    }

    const { fieldId, userId, ...updateData } = args;
    return await ctx.db.patch(args.fieldId, {
      ...updateData,
      updatedAt: Date.now(),
    });
  },
});

// Delete a field
export const deleteField = mutation({
  args: {
    fieldId: v.id("fields"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const field = await ctx.db.get(args.fieldId);
    if (!field || field.userId !== user._id) {
      throw new Error("Field not found or access denied");
    }

    await ctx.db.delete(args.fieldId);
  },
});

// Get a specific field by ID
export const getFieldById = query({
  args: {
    fieldId: v.id("fields"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return null;
    }

    const field = await ctx.db.get(args.fieldId);
    if (!field || field.userId !== user._id) {
      return null;
    }

    return field;
  },
});

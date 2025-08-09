// convex/plantHealth.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const uploadPlantImage = mutation({
  args: {
    userId: v.id("users"),
    cropId: v.id("crops"),
    imageUrl: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
    location: v.optional(v.object({
      latitude: v.number(),
      longitude: v.number(),
    })),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const imageId = await ctx.db.insert("plantImages", {
      ...args,
      uploadedAt: Date.now(),
    });

    return imageId;
  },
});

export const updatePlantImageAnalysis = mutation({
  args: {
    imageId: v.id("plantImages"),
    detectedIssues: v.array(v.object({
      issue: v.string(),
      confidence: v.number(),
      severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    })),
    treatmentRecommendations: v.array(v.object({
      treatment: v.string(),
      priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
      estimatedCost: v.optional(v.number()),
    })),
    aiResult: v.object({
      confidence: v.number(),
      model: v.string(),
      processingTime: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const { imageId, ...updateData } = args;
    await ctx.db.patch(imageId, updateData);
  },
});

export const getRecentPlantImages = query({
  args: { 
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const images = await ctx.db
      .query("plantImages")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(args.limit || 20);

    return images;
  },
});
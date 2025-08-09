// convex/recommendations.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getRecommendations = query({
  args: { 
    userId: v.id("users"),
    type: v.optional(v.union(
      v.literal("planting"),
      v.literal("fertilizing"),
      v.literal("watering"),
      v.literal("pest_control"),
      v.literal("harvest_timing"),
      v.literal("market_timing")
    )),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("recommendations")
      .withIndex("by_user", (q) => q.eq("userId", args.userId));

    const recommendations = await query.collect();

    let filteredRecommendations = recommendations.filter(rec => 
      rec.status !== "dismissed"
    );

    if (args.type) {
      filteredRecommendations = filteredRecommendations.filter(rec =>
        rec.type === args.type
      );
    }

    if (args.priority) {
      filteredRecommendations = filteredRecommendations.filter(rec =>
        rec.priority === args.priority
      );
    }

    return filteredRecommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  },
});

export const updateRecommendationStatus = mutation({
  args: {
    recommendationId: v.id("recommendations"),
    status: v.union(
      v.literal("pending"),
      v.literal("acknowledged"),
      v.literal("implemented"),
      v.literal("dismissed")
    ),
    feedback: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { recommendationId, ...updateData } = args;
    await ctx.db.patch(recommendationId, updateData);
  },
});
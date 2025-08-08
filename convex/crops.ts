
// convex/crops.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Queries for Dashboard Page
export const getDashboardStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const crops = await ctx.db
      .query("crops")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const activeCrops = crops.filter(crop => 
      ["planted", "growing"].includes(crop.status)
    ).length;

    const totalFields = new Set(crops.map(crop => crop.fieldLocation)).size || crops.length;

    const waterUsage = await ctx.db
      .query("waterUsage")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const totalWaterUsage = waterUsage
      .filter(usage => {
        const usageDate = new Date(usage.date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return usageDate >= thirtyDaysAgo;
      })
      .reduce((total, usage) => total + usage.amount, 0);

    const equipment = await ctx.db
      .query("equipment")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return {
      totalFields,
      activeCrops,
      waterUsage: Math.round(totalWaterUsage / 1000), // Convert to thousands of liters
      equipment: equipment.length,
    };
  },
});

export const getCropsForCalendar = query({
  args: { 
    userId: v.id("users"),
    year: v.optional(v.string()),
    cropType: v.optional(v.string()),
    searchQuery: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let cropsQuery = ctx.db
      .query("crops")
      .withIndex("by_user", (q) => q.eq("userId", args.userId));

    const crops = await cropsQuery.collect();

    // Filter by crop type if specified
    let filteredCrops = crops;
    if (args.cropType && args.cropType !== "All Crops") {
      const categoryMap: Record<string, string> = {
        "Grains": "grains",
        "Vegetables": "vegetables",
        "Fruits": "fruits",
        "Root Crops": "root_crops",
      };
      const category = categoryMap[args.cropType];
      if (category) {
        filteredCrops = crops.filter(crop => crop.category === category);
      }
    }

    // Filter by search query
    if (args.searchQuery) {
      filteredCrops = filteredCrops.filter(crop =>
        crop.name.toLowerCase().includes(args.searchQuery!.toLowerCase()) ||
        crop.type.toLowerCase().includes(args.searchQuery!.toLowerCase())
      );
    }

    // Filter by year
    if (args.year) {
      filteredCrops = filteredCrops.filter(crop => {
        if (crop.plantingDate) {
          return new Date(crop.plantingDate).getFullYear().toString() === args.year;
        }
        return true;
      });
    }

    // Get calendar data for each crop
    const cropsWithCalendars = await Promise.all(
      filteredCrops.map(async (crop) => {
        const calendar = await ctx.db
          .query("cropCalendars")
          .withIndex("by_crop", (q) => q.eq("cropId", crop._id))
          .first();

        return {
          ...crop,
          calendar,
        };
      })
    );

    return cropsWithCalendars;
  },
});

export const getHarvestData = query({
  args: { 
    userId: v.id("users"),
    timeRange: v.optional(v.string()), // "30d", "90d", "1y"
  },
  handler: async (ctx, args) => {
    const harvests = await ctx.db
      .query("harvests")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Filter by time range if specified
    let filteredHarvests = harvests;
    if (args.timeRange) {
      const days = args.timeRange === "30d" ? 30 : args.timeRange === "90d" ? 90 : 365;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      filteredHarvests = harvests.filter(harvest => 
        new Date(harvest.harvestDate) >= cutoffDate
      );
    }

    return filteredHarvests.map(harvest => ({
      ...harvest,
      profitMargin: harvest.revenue && harvest.costs?.total 
        ? ((harvest.revenue - harvest.costs.total) / harvest.revenue) * 100
        : 0,
    }));
  },
});

// Mutations
export const createCrop = mutation({
  args: {
    name: v.string(),
    type: v.string(),
    category: v.optional(v.union(
      v.literal("grains"),
      v.literal("vegetables"),
      v.literal("fruits"),
      v.literal("root_crops"),
      v.literal("legumes")
    )),
    userId: v.id("users"),
    fieldLocation: v.optional(v.string()),
    areaPlanted: v.optional(v.number()),
    plantingDate: v.optional(v.string()),
    expectedHarvestDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const cropId = await ctx.db.insert("crops", {
      ...args,
      status: "planned",
      createdAt: Date.now(),
    });

    return cropId;
  },
});

export const updateCropStatus = mutation({
  args: {
    cropId: v.id("crops"),
    status: v.union(
      v.literal("planned"),
      v.literal("planted"),
      v.literal("growing"),
      v.literal("ready_to_harvest"),
      v.literal("harvested"),
      v.literal("failed")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.cropId, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});

export const createCropCalendar = mutation({
  args: {
    cropId: v.id("crops"),
    userId: v.id("users"),
    season: v.string(),
    schedule: v.array(
      v.object({
        date: v.string(),
        action: v.string(),
        description: v.optional(v.string()),
        completed: v.boolean(),
        weather: v.optional(v.object({
          temperature: v.optional(v.number()),
          rainfall: v.optional(v.number()),
          humidity: v.optional(v.number()),
        })),
        reminder: v.optional(v.string()),
        cost: v.optional(v.number()),
      })
    ),
    totalEstimatedCost: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const calendarId = await ctx.db.insert("cropCalendars", {
      ...args,
      createdAt: Date.now(),
    });

    return calendarId;
  },
});
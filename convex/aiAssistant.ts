import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Store a new AI conversation message in the database
 */
export const storeConversationMessage = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const conversationId = await ctx.db.insert("aiConversations", {
      userId: args.userId,
      role: args.role,
      content: args.content,
      timestamp: Date.now(),
    });
    
    return conversationId;
  },
});

/**
 * Get conversation history for a user
 */
export const getConversationHistory = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("aiConversations")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("asc")
      .collect();
    
    return messages;
  },
});

/**
 * Get user's crop information
 */
export const getUserCrops = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const crops = await ctx.db
      .query("crops")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    return crops;
  },
});

/**
 * Get user's soil data
 */
export const getUserSoilData = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const soilData = await ctx.db
      .query("soilData")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    return soilData;
  },
});

/**
 * Get user's weather data
 */
export const getUserWeatherData = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const weatherData = await ctx.db
      .query("weatherData")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    return weatherData;
  },
});

/**
 * Get user's crop calendar
 */
export const getUserCropCalendars = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const calendars = await ctx.db
      .query("cropCalendars")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    return calendars;
  },
});

/**
 * Get user's recommendations
 */
export const getUserRecommendations = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const recommendations = await ctx.db
      .query("recommendations")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    return recommendations;
  },
});

/**
 * Store a new recommendation for the user
 */
export const storeRecommendation = mutation({
  args: {
    userId: v.id("users"),
    cropId: v.optional(v.id("crops")),
    type: v.union(
      v.literal("planting"),
      v.literal("fertilizing"),
      v.literal("watering"),
      v.literal("pest_control"),
      v.literal("harvest_timing"),
      v.literal("market_timing")
    ),
    title: v.string(),
    description: v.string(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    confidence: v.optional(v.number()),
    dueDate: v.optional(v.string()),
    estimatedImpact: v.optional(v.string()),
    estimatedCost: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const recommendationId = await ctx.db.insert("recommendations", {
      userId: args.userId,
      cropId: args.cropId,
      type: args.type,
      title: args.title,
      description: args.description,
      priority: args.priority,
      confidence: args.confidence,
      dueDate: args.dueDate,
      estimatedImpact: args.estimatedImpact,
      estimatedCost: args.estimatedCost,
      status: "pending",
      createdAt: Date.now(),
    });
    
    return recommendationId;
  },
});

/**
 * Add a new crop to the crops table
 */
export const addCrop = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    type: v.string(),
    category: v.optional(v.union(
      v.literal("grains"),
      v.literal("vegetables"),
      v.literal("fruits"),
      v.literal("root_crops"),
      v.literal("legumes")
    )),
    fieldLocation: v.optional(v.string()),
    areaPlanted: v.optional(v.number()),
    plantingDate: v.optional(v.string()),
    expectedHarvestDate: v.optional(v.string()),
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
    const cropId = await ctx.db.insert("crops", {
      userId: args.userId,
      name: args.name,
      type: args.type,
      category: args.category,
      fieldLocation: args.fieldLocation,
      areaPlanted: args.areaPlanted,
      plantingDate: args.plantingDate,
      expectedHarvestDate: args.expectedHarvestDate,
      status: args.status,
      createdAt: Date.now(),
    });
    
    return cropId;
  },
});

/**
 * Add or update a crop calendar entry
 */
export const upsertCropCalendar = mutation({
  args: {
    userId: v.id("users"),
    cropId: v.id("crops"),
    season: v.string(),
    schedule: v.array(
      v.object({
        date: v.string(), // ISO date
        action: v.string(), // "planting", "fertilizing", "watering", "pesticide", "harvesting"
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
    // Check if a calendar entry already exists for this crop and season
    const existingCalendar = await ctx.db
      .query("cropCalendars")
      .withIndex("by_crop", (q) => q.eq("cropId", args.cropId))
      .collect();
      
    const existingEntry = existingCalendar.find(entry => entry.season === args.season);
    
    if (existingEntry) {
      // Update existing entry
      await ctx.db.patch(existingEntry._id, {
        schedule: args.schedule,
        totalEstimatedCost: args.totalEstimatedCost,
        updatedAt: Date.now(),
      });
      
      return existingEntry._id;
    } else {
      // Create new entry
      const calendarId = await ctx.db.insert("cropCalendars", {
        userId: args.userId,
        cropId: args.cropId,
        season: args.season,
        schedule: args.schedule,
        totalEstimatedCost: args.totalEstimatedCost,
        createdAt: Date.now(),
      });
      
      return calendarId;
    }
  },
});

/**
 * Populate crop calendar with detailed schedule
 */
export const populateCropCalendar = mutation({
  args: {
    userId: v.id("users"),
    cropId: v.id("crops"),
    season: v.string(),
    schedule: v.array(
      v.object({
        date: v.string(), // ISO date
        action: v.string(), // "planting", "fertilizing", "watering", "pesticide", "harvesting"
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
    // Check if a calendar entry already exists for this crop and season
    const existingCalendar = await ctx.db
      .query("cropCalendars")
      .withIndex("by_crop", (q) => q.eq("cropId", args.cropId))
      .collect();
      
    const existingEntry = existingCalendar.find(entry => entry.season === args.season);
    
    if (existingEntry) {
      // Update existing entry
      await ctx.db.patch(existingEntry._id, {
        schedule: args.schedule,
        totalEstimatedCost: args.totalEstimatedCost,
        updatedAt: Date.now(),
      });
      
      return existingEntry._id;
    } else {
      // Create new entry
      const calendarId = await ctx.db.insert("cropCalendars", {
        userId: args.userId,
        cropId: args.cropId,
        season: args.season,
        schedule: args.schedule,
        totalEstimatedCost: args.totalEstimatedCost,
        createdAt: Date.now(),
      });
      
      return calendarId;
    }
  },
});
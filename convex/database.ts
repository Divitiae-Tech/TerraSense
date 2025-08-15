import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getAllUserData = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const [
      user,
      conversations,
      crops,
      soilData,
      plantImages,
      harvests,
      marketplaceListings,
      weatherData,
      recommendations,
      equipment,
      waterUsage,
      seedStock
    ] = await Promise.all([
      ctx.db.query("users").filter(q => q.eq(q.field("_id"), userId)).first(),
      ctx.db.query("aiConversations").withIndex("by_user", q => q.eq("userId", userId)).collect(),
      ctx.db.query("crops").withIndex("by_user", q => q.eq("userId", userId)).collect(),
      ctx.db.query("soilData").withIndex("by_user", q => q.eq("userId", userId)).collect(),
      ctx.db.query("plantImages").withIndex("by_user", q => q.eq("userId", userId)).collect(),
      ctx.db.query("harvests").withIndex("by_user", q => q.eq("userId", userId)).collect(),
      ctx.db.query("marketplaceListings").withIndex("by_user", q => q.eq("userId", userId)).collect(),
      ctx.db.query("weatherData").withIndex("by_user", q => q.eq("userId", userId)).collect(),
      ctx.db.query("recommendations").withIndex("by_user", q => q.eq("userId", userId)).collect(),
      ctx.db.query("equipment").withIndex("by_user", q => q.eq("userId", userId)).collect(),
      ctx.db.query("waterUsage").withIndex("by_user", q => q.eq("userId", userId)).collect(),
      ctx.db.query("seedStock").withIndex("by_user", q => q.eq("userId", userId)).collect()
    ]);

    return {
      user,
      conversations,
      crops,
      soilData,
      plantImages,
      harvests,
      marketplaceListings,
      weatherData,
      recommendations,
      equipment,
      waterUsage,
      seedStock
    };
  },
});

export const createRecord = mutation({
  args: {
    table: v.string(),
    data: v.any()
  },
  handler: async (ctx, { table, data }) => {
    return await ctx.db.insert(table as any, data);
  },
});

export const updateRecord = mutation({
  args: {
    id: v.string(),
    data: v.any()
  },
  handler: async (ctx, { id, data }) => {
    return await ctx.db.patch(id as any, data);
  },
});

export const deleteRecord = mutation({
  args: {
    id: v.string()
  },
  handler: async (ctx, { id }) => {
    return await ctx.db.delete(id as any);
  },
});

export const getRecords = query({
  args: {
    table: v.string(),
    filter: v.optional(v.any())
  },
  handler: async (ctx, { table, filter }) => {
    let query = ctx.db.query(table as any);
    if (filter) {
      query = query.filter(filter);
    }
    return await query.collect();
  },
});

export const storeConversation = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("aiConversations", {
      ...args,
      timestamp: Date.now(),
    });
  },
});

export const getConversations = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("aiConversations")
      .withIndex("by_user", q => q.eq("userId", userId))
      .order("asc")
      .collect();
  },
});

export const createCrop = mutation({
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
    return await ctx.db.insert("crops", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const updateCrop = mutation({
  args: {
    id: v.id("crops"),
    data: v.any()
  },
  handler: async (ctx, { id, data }) => {
    return await ctx.db.patch(id, { ...data, updatedAt: Date.now() });
  },
});

export const createSoilData = mutation({
  args: {
    cropId: v.id("crops"),
    userId: v.id("users"),
    fieldId: v.optional(v.string()),
    pH: v.optional(v.number()),
    nutrients: v.optional(v.object({
      nitrogen: v.optional(v.number()),
      phosphorus: v.optional(v.number()),
      potassium: v.optional(v.number()),
      organicMatter: v.optional(v.number()),
    })),
    soilType: v.optional(v.string()),
    moisture: v.optional(v.number()),
    temperature: v.optional(v.number()),
    testDate: v.string(),
    recommendations: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("soilData", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const createPlantImage = mutation({
  args: {
    userId: v.id("users"),
    cropId: v.id("crops"),
    imageUrl: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
    detectedIssues: v.optional(v.array(v.object({
      issue: v.string(),
      confidence: v.number(),
      severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    }))),
    treatmentRecommendations: v.optional(v.array(v.object({
      treatment: v.string(),
      priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
      estimatedCost: v.optional(v.number()),
    }))),
    aiResult: v.optional(v.object({
      confidence: v.number(),
      model: v.string(),
      processingTime: v.optional(v.number()),
    })),
    location: v.optional(v.object({
      latitude: v.number(),
      longitude: v.number(),
    })),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("plantImages", {
      ...args,
      uploadedAt: Date.now(),
    });
  },
});

export const createHarvest = mutation({
  args: {
    cropId: v.id("crops"),
    userId: v.id("users"),
    season: v.string(),
    harvestDate: v.string(),
    yieldAmount: v.number(),
    yieldPerHectare: v.optional(v.number()),
    quality: v.optional(v.union(
      v.literal("excellent"),
      v.literal("good"),
      v.literal("fair"),
      v.literal("poor")
    )),
    environmentalData: v.optional(v.object({
      totalRainfall: v.optional(v.number()),
      avgTemperature: v.optional(v.number()),
      sunlightHours: v.optional(v.number()),
      humidityAvg: v.optional(v.number()),
    })),
    costs: v.optional(v.object({
      seeds: v.optional(v.number()),
      fertilizer: v.optional(v.number()),
      pesticides: v.optional(v.number()),
      labor: v.optional(v.number()),
      equipment: v.optional(v.number()),
      total: v.optional(v.number()),
    })),
    revenue: v.optional(v.number()),
    profit: v.optional(v.number()),
    feedback: v.optional(v.string()),
    lessonsLearned: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("harvests", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const createMarketplaceListing = mutation({
  args: {
    userId: v.id("users"),
    cropId: v.optional(v.id("crops")),
    title: v.string(),
    description: v.optional(v.string()),
    category: v.string(),
    quantity: v.number(),
    unit: v.string(),
    pricePerUnit: v.number(),
    totalPrice: v.number(),
    currency: v.optional(v.string()),
    location: v.string(),
    coordinates: v.optional(v.object({
      latitude: v.number(),
      longitude: v.number(),
    })),
    transportNeeds: v.optional(v.union(
      v.literal("pickup_only"),
      v.literal("delivery_available"),
      v.literal("flexible")
    )),
    deliveryRadius: v.optional(v.number()),
    images: v.optional(v.array(v.string())),
    qualityGrade: v.optional(v.union(
      v.literal("premium"),
      v.literal("standard"),
      v.literal("economy")
    )),
    harvestDate: v.optional(v.string()),
    expiryDate: v.optional(v.string()),
    organicCertified: v.optional(v.boolean()),
    available: v.boolean(),
    featured: v.optional(v.boolean()),
    views: v.optional(v.number()),
    contactMethod: v.optional(v.union(
      v.literal("phone"),
      v.literal("email"),
      v.literal("platform_message")
    )),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("marketplaceListings", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const createWeatherData = mutation({
  args: {
    userId: v.id("users"),
    location: v.object({
      lat: v.number(),
      lon: v.number(),
      timezone: v.string(),
    }),
    units: v.string(),
    current: v.object({
      temperature: v.number(),
      cloudCover: v.number(),
      wind: v.object({
        speed: v.number(),
        direction: v.number(),
      }),
      precipitation: v.object({
        total: v.number(),
        type: v.string(),
      }),
      condition: v.object({
        code: v.string(),
        icon: v.string(),
        summary: v.string(),
      }),
      sunlight: v.object({
        sunrise: v.union(v.string(), v.null()),
        sunset: v.union(v.string(), v.null()),
      }),
      timestamp: v.string(),
    }),
    daily: v.optional(v.object({
      data: v.array(v.object({
        date: v.string(),
        temperature: v.object({
          min: v.optional(v.number()),
          max: v.optional(v.number()),
        }),
        humidity: v.optional(v.object({
          min: v.optional(v.number()),
          max: v.optional(v.number()),
        })),
        precipitation: v.object({
          total: v.optional(v.number()),
          probability: v.optional(v.number()),
        }),
        condition: v.object({
          summary: v.optional(v.string()),
          icon: v.optional(v.string()),
          code: v.optional(v.string()),
        }),
        sunlight: v.optional(v.object({
          sunrise: v.optional(v.string()),
          sunset: v.optional(v.string()),
        })),
      }))
    })),
    hourly: v.optional(v.array(v.object({
      timestamp: v.string(),
      temperature: v.optional(v.number()),
      feelsLike: v.optional(v.number()),
      humidity: v.optional(v.number()),
      dewPoint: v.optional(v.number()),
      pressure: v.optional(v.number()),
      cloudCover: v.optional(v.number()),
      wind: v.optional(v.object({
        speed: v.optional(v.number()),
        direction: v.optional(v.number()),
      })),
      precipitation: v.optional(v.object({
        total: v.optional(v.number()),
        probability: v.optional(v.number()),
      })),
      condition: v.optional(v.object({
        summary: v.optional(v.string()),
        icon: v.optional(v.string()),
        code: v.optional(v.string()),
      })),
    }))),
    derived: v.optional(v.object({
      temperatureRange: v.optional(v.number()),
      pressureTrend: v.optional(v.object({
        direction: v.optional(v.string()),
      })),
      humidityTrend: v.optional(v.object({
        direction: v.optional(v.string()),
      })),
      windConsistency: v.optional(v.object({
        averageSpeed: v.optional(v.number()),
      })),
      precipitationPattern: v.optional(v.object({
        hoursWithRain: v.optional(v.number()),
      })),
      weatherStability: v.optional(v.object({
        temperatureStability: v.optional(v.string()),
      })),
      seasonalContext: v.optional(v.object({
        season: v.optional(v.string()),
      })),
    })),
    source: v.optional(v.string()),
    dataType: v.optional(v.union(
      v.literal("current"),
      v.literal("forecast"), 
      v.literal("current_and_forecast")
    )),
    expiresAt: v.optional(v.number()),
    query: v.optional(v.string()),
    requestType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("weatherData", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const createRecommendation = mutation({
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
    return await ctx.db.insert("recommendations", {
      ...args,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

export const createEquipment = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    type: v.string(),
    status: v.union(
      v.literal("operational"),
      v.literal("maintenance_needed"),
      v.literal("out_of_service")
    ),
    purchaseDate: v.optional(v.string()),
    lastMaintenanceDate: v.optional(v.string()),
    nextMaintenanceDate: v.optional(v.string()),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("equipment", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const createWaterUsage = mutation({
  args: {
    userId: v.id("users"),
    cropId: v.optional(v.id("crops")),
    date: v.string(),
    amount: v.number(),
    source: v.optional(v.string()),
    cost: v.optional(v.number()),
    efficiency: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("waterUsage", {
      ...args,
      createdAt: Date.now(),
    });
  },
});


export const createSeedStock = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    type: v.union(
      v.literal("seeds"),
      v.literal("fertilizer"),
      v.literal("pesticide"),
      v.literal("equipment"),
      v.literal("other")
    ),
    category: v.optional(v.string()),
    variety: v.optional(v.string()),
    currentStock: v.number(),
    maxCapacity: v.number(),
    unit: v.string(),
    minThreshold: v.optional(v.number()),
    costPerUnit: v.optional(v.number()),
    supplier: v.optional(v.string()),
    expiryDate: v.optional(v.string()),
    batchNumber: v.optional(v.string()),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("seedStock", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const updateSeedStock = mutation({
  args: {
    id: v.id("seedStock"),
    currentStock: v.optional(v.number()),
    maxCapacity: v.optional(v.number()),
    minThreshold: v.optional(v.number()),
    costPerUnit: v.optional(v.number()),
    supplier: v.optional(v.string()),
    expiryDate: v.optional(v.string()),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...updates }) => {
    return await ctx.db.patch(id, {
      ...updates,
      lastUpdated: Date.now(),
    });
  },
});

export const getSeedStock = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("seedStock")
      .withIndex("by_user", q => q.eq("userId", userId))
      .collect();
  },
});

export const getLowStockItems = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const allStock = await ctx.db
      .query("seedStock")
      .withIndex("by_user", q => q.eq("userId", userId))
      .collect();
    
    return allStock.filter(item => {
      const threshold = item.minThreshold || (item.maxCapacity * 0.2);
      return item.currentStock <= threshold;
    });
  },
});

export const adjustStock = mutation({
  args: {
    id: v.id("seedStock"),
    adjustment: v.number(), // positive for adding, negative for using
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { id, adjustment, notes }) => {
    const item = await ctx.db.get(id);
    if (!item) {
      throw new Error("Stock item not found");
    }
    
    const newStock = Math.max(0, item.currentStock + adjustment);
    
    return await ctx.db.patch(id, {
      currentStock: newStock,
      lastUpdated: Date.now(),
      notes: notes || item.notes,
    });
  },
});

export const initializeSeedStockForUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
    // Check if user already has seed stock data
    const existingStock = await ctx.db
      .query("seedStock")
      .withIndex("by_user", q => q.eq("userId", userId))
      .first();
    
    if (existingStock) {
      return { message: "User already has seed stock data" };
    }

    // Create initial seed stock items
    const initialStock = [
      {
        name: "Tomato Seeds",
        type: "seeds" as const,
        category: "vegetable_seeds",
        variety: "Cherry Tomato",
        currentStock: 85,
        maxCapacity: 100,
        unit: "packets",
        minThreshold: 20,
        costPerUnit: 2.50,
        supplier: "Green Thumb Seeds Co.",
        location: "Storage Room A"
      },
      {
        name: "Corn Seeds",
        type: "seeds" as const,
        category: "grain_seeds",
        variety: "Sweet Corn",
        currentStock: 60,
        maxCapacity: 100,
        unit: "kg",
        minThreshold: 15,
        costPerUnit: 5.00,
        supplier: "Farm Supply Plus",
        location: "Storage Room A"
      },
      {
        name: "Wheat Seeds",
        type: "seeds" as const,
        category: "grain_seeds",
        variety: "Winter Wheat",
        currentStock: 40,
        maxCapacity: 100,
        unit: "bags",
        minThreshold: 10,
        costPerUnit: 12.00,
        supplier: "AgriSeeds Ltd.",
        location: "Storage Room B"
      },
      {
        name: "Organic Fertilizer",
        type: "fertilizer" as const,
        category: "organic",
        currentStock: 25,
        maxCapacity: 100,
        unit: "bags",
        minThreshold: 20,
        costPerUnit: 8.50,
        supplier: "Eco Farm Solutions",
        location: "Storage Room C"
      },
      {
        name: "All-Purpose Pesticide",
        type: "pesticide" as const,
        category: "organic",
        currentStock: 15,
        maxCapacity: 50,
        unit: "liters",
        minThreshold: 10,
        costPerUnit: 25.00,
        supplier: "SafeGrow Products",
        location: "Chemical Storage"
      }
    ];

    const insertPromises = initialStock.map(item => 
      ctx.db.insert("seedStock", {
        ...item,
        userId,
        createdAt: Date.now()
      })
    );

    await Promise.all(insertPromises);
    
    return { message: "Initial seed stock created successfully", count: initialStock.length };
  },
});
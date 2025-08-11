import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const schema = defineSchema({
  // User management
  users: defineTable({
    clerkId: v.string(),// Stores the Clerk user ID
    name: v.string(),
    email: v.string(),
    role: v.optional(v.union(v.literal("farmer"), v.literal("admin"), v.literal("buyer"))),
    location: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    farmSize: v.optional(v.number()), // in hectares
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    imageUrl: v.optional(v.string()),
  })
  .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  // Core crop information
  crops: defineTable({
    name: v.string(),
    type: v.string(), // e.g., "maize", "wheat", "tomatoes"
    category: v.optional(v.union(
      v.literal("grains"),
      v.literal("vegetables"),
      v.literal("fruits"),
      v.literal("root_crops"),
      v.literal("legumes")
    )),
    userId: v.id("users"),
    fieldLocation: v.optional(v.string()),
    areaPlanted: v.optional(v.number()), // in hectares
    plantingDate: v.optional(v.string()), // ISO date
    expectedHarvestDate: v.optional(v.string()), // ISO date
    status: v.union(
      v.literal("planned"),
      v.literal("planted"),
      v.literal("growing"),
      v.literal("ready_to_harvest"),
      v.literal("harvested"),
      v.literal("failed")
    ),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_type", ["type"])
    .index("by_user_and_status", ["userId", "status"]),

  // Detailed crop planning and calendars
  cropCalendars: defineTable({
    cropId: v.id("crops"),
    userId: v.id("users"),
    season: v.string(), // e.g., "2024-spring", "2024-fall"
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
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_crop", ["cropId"])
    .index("by_user", ["userId"])
    .index("by_season", ["season"]),

  // Soil data and environmental conditions
  soilData: defineTable({
    cropId: v.id("crops"),
    userId: v.id("users"),
    fieldId: v.optional(v.string()), // for multiple fields
    pH: v.optional(v.number()),
    nutrients: v.optional(v.object({
      nitrogen: v.optional(v.number()), // ppm
      phosphorus: v.optional(v.number()), // ppm
      potassium: v.optional(v.number()), // ppm
      organicMatter: v.optional(v.number()), // percentage
    })),
    soilType: v.optional(v.string()), // "clay", "sandy", "loam", etc.
    moisture: v.optional(v.number()), // percentage
    temperature: v.optional(v.number()), // celsius
    testDate: v.string(), // ISO date
    recommendations: v.optional(v.array(v.string())),
    createdAt: v.number(),
  })
    .index("by_crop", ["cropId"])
    .index("by_user", ["userId"])
    .index("by_test_date", ["testDate"]),

  // Plant health and disease detection
  plantImages: defineTable({
    userId: v.id("users"),
    cropId: v.id("crops"),
    imageUrl: v.string(), // Convex file storage URL
    imageStorageId: v.optional(v.id("_storage")), // Convex file storage ID
    detectedIssues: v.optional(v.array(v.object({
      issue: v.string(),
      confidence: v.number(), // 0-1
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
      processingTime: v.optional(v.number()), // milliseconds
    })),
    location: v.optional(v.object({
      latitude: v.number(),
      longitude: v.number(),
    })),
    notes: v.optional(v.string()),
    uploadedAt: v.number(),
  })
    .index("by_crop", ["cropId"])
    .index("by_user", ["userId"])
    .index("by_upload_date", ["uploadedAt"]),

  // Historical harvest data and yield tracking
  harvests: defineTable({
    cropId: v.id("crops"),
    userId: v.id("users"),
    season: v.string(),
    harvestDate: v.string(), // ISO date
    yieldAmount: v.number(), // in kg or tons
    yieldPerHectare: v.optional(v.number()),
    quality: v.optional(v.union(
      v.literal("excellent"),
      v.literal("good"),
      v.literal("fair"),
      v.literal("poor")
    )),
    environmentalData: v.optional(v.object({
      totalRainfall: v.optional(v.number()), // mm
      avgTemperature: v.optional(v.number()), // celsius
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
    createdAt: v.number(),
  })
    .index("by_crop", ["cropId"])
    .index("by_user", ["userId"])
    .index("by_season", ["season"])
    .index("by_harvest_date", ["harvestDate"]),

  // Marketplace listings for selling produce
  marketplaceListings: defineTable({
    userId: v.id("users"),
    cropId: v.optional(v.id("crops")), // Optional for processed products
    title: v.string(),
    description: v.optional(v.string()),
    category: v.string(),
    quantity: v.number(),
    unit: v.string(), // "kg", "tons", "bags", "crates"
    pricePerUnit: v.number(),
    totalPrice: v.number(),
    currency: v.optional(v.string()), // default to local currency
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
    deliveryRadius: v.optional(v.number()), // in km
    images: v.optional(v.array(v.string())), // image URLs
    qualityGrade: v.optional(v.union(
      v.literal("premium"),
      v.literal("standard"),
      v.literal("economy")
    )),
    harvestDate: v.optional(v.string()), // ISO date
    expiryDate: v.optional(v.string()), // ISO date
    organicCertified: v.optional(v.boolean()),
    available: v.boolean(),
    featured: v.optional(v.boolean()),
    views: v.optional(v.number()),
    contactMethod: v.optional(v.union(
      v.literal("phone"),
      v.literal("email"),
      v.literal("platform_message")
    )),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_category", ["category"])
    .index("by_location", ["location"])
    .index("by_available", ["available"])
    .index("by_featured", ["featured"])
    .index("by_price", ["pricePerUnit"]),

  // Enhanced weather data integration
// Updated weatherData table to match the new API response format
weatherData: defineTable({
  userId: v.id("users"),
  
  // Location data from API
  location: v.object({
    lat: v.string(), // e.g., "26.2041S"
    lon: v.string(), // e.g., "28.0473E"
    elevation: v.number(), // in meters
    timezone: v.string(), // e.g., "Africa/Johannesburg"
  }),
  
  // API configuration
  units: v.string(), // "metric" or "imperial"
  
  // Current weather conditions
  current: v.object({
    icon: v.string(), // e.g., "sunny"
    icon_num: v.number(), // e.g., 2
    summary: v.string(), // e.g., "Sunny"
    temperature: v.number(), // current temperature
    wind: v.object({
      speed: v.number(), // wind speed
      angle: v.number(), // wind angle in degrees
      dir: v.string(), // wind direction (N, NE, etc.)
    }),
    precipitation: v.object({
      total: v.number(), // precipitation amount
      type: v.string(), // "none", "rain", "snow", etc.
    }),
    cloud_cover: v.number(), // cloud coverage percentage
  }),
  
  // Daily forecast data
  daily: v.optional(v.object({
    data: v.array(v.object({
      day: v.string(), // ISO date string "2025-08-11"
      weather: v.string(), // weather condition
      icon: v.number(), // weather icon number
      summary: v.string(), // detailed summary
      all_day: v.object({
        weather: v.string(),
        icon: v.number(),
        temperature: v.number(), // average temperature
        temperature_min: v.number(), // minimum temperature
        temperature_max: v.number(), // maximum temperature
        wind: v.object({
          speed: v.number(),
          dir: v.string(),
          angle: v.number(),
        }),
        cloud_cover: v.object({
          total: v.number(), // cloud coverage percentage
        }),
        precipitation: v.object({
          total: v.number(),
          type: v.string(),
        }),
      }),
      // These can be null in the API response
      morning: v.optional(v.any()), // Can be detailed object or null
      afternoon: v.optional(v.any()), // Can be detailed object or null
      evening: v.optional(v.any()), // Can be detailed object or null
    }))
  })),
  
  // Hourly data (null in your example but may be available)
  hourly: v.optional(v.any()), // Can be array of hourly data or null
  
  // Metadata
  source: v.optional(v.string()), // API source identifier
  dataType: v.union(
    v.literal("current"),
    v.literal("forecast"), 
    v.literal("current_and_forecast")
  ),
  createdAt: v.number(),
  expiresAt: v.optional(v.number()), // For caching weather data
  
  // Optional fields for backward compatibility or additional data
  query: v.optional(v.string()), // Original query used
  requestType: v.optional(v.string()), // "coordinates", "city", etc.
})
  .index("by_user", ["userId"])
  .index("by_location", ["location.lat", "location.lon"])
  .index("by_data_type", ["dataType"])
  .index("by_created_at", ["createdAt"])
  .index("by_expires_at", ["expiresAt"]),

  // AI recommendations and insights
  recommendations: defineTable({
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
    confidence: v.optional(v.number()), // 0-1
    dueDate: v.optional(v.string()), // ISO date
    estimatedImpact: v.optional(v.string()),
    estimatedCost: v.optional(v.number()),
    status: v.union(
      v.literal("pending"),
      v.literal("acknowledged"),
      v.literal("implemented"),
      v.literal("dismissed")
    ),
    feedback: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_crop", ["cropId"])
    .index("by_type", ["type"])
    .index("by_priority", ["priority"])
    .index("by_status", ["status"]),

  // Farm equipment and resources
  equipment: defineTable({
    userId: v.id("users"),
    name: v.string(),
    type: v.string(), // "tractor", "irrigation", "harvester", etc.
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
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  // Water usage and irrigation tracking
  waterUsage: defineTable({
    userId: v.id("users"),
    cropId: v.optional(v.id("crops")),
    date: v.string(), // ISO date
    amount: v.number(), // liters
    source: v.optional(v.string()), // "irrigation", "rainfall", "manual"
    cost: v.optional(v.number()),
    efficiency: v.optional(v.number()), // percentage
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_crop", ["cropId"])
    .index("by_date", ["date"]),
});

export default schema;
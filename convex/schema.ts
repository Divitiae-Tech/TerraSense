import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const schema = defineSchema({
// AI Conversations
aiConversations: defineTable({
  userId: v.id("users"),
  role: v.union(v.literal("user"), v.literal("assistant")),
  content: v.string(),
  timestamp: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_timestamp", ["timestamp"]),

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
// Enhanced weatherData table to match the merged Meteosource + Open-Meteo API response
weatherData: defineTable({
  userId: v.id("users"),

  // Location from API
  location: v.object({
    lat: v.number(), // latitude as number
    lon: v.number(), // longitude as number
    timezone: v.string(), // e.g., "Africa/Johannesburg"
  }),

  units: v.string(), // "metric" or "imperial"

  // Current weather
  current: v.object({
    temperature: v.number(), // current temperature
    cloudCover: v.number(), // cloud coverage percentage
    wind: v.object({
      speed: v.number(), // wind speed
      direction: v.number(), // wind direction in degrees
    }),
    precipitation: v.object({
      total: v.number(), // precipitation amount
      type: v.string(), // "none", "rain", "snow", etc.
    }),
    condition: v.object({
      code: v.string(), // e.g., "overcast"
      icon: v.string(), // e.g., "cloudy"
      summary: v.string(), // e.g., "Overcast"
    }),
    sunlight: v.object({
      sunrise: v.union(v.string(), v.null()), // sunrise time or null
      sunset: v.union(v.string(), v.null()), // sunset time or null
    }),
    timestamp: v.string(), // ISO timestamp
  }),
  precipitation: v.object({
    total: v.optional(v.union(v.number(), v.null())),
    probability: v.optional(v.union(v.number(), v.null())),
    type: v.optional(v.union(v.string(), v.null())),
  }),
  condition: v.object({
    summary: v.optional(v.union(v.string(), v.null())),
    icon: v.optional(v.union(v.string(), v.null())),
    code: v.union(v.number(), v.string(), v.null())
  }),
  sunlight: v.object({
    sunrise: v.optional(v.union(v.string(), v.null())),
    sunset: v.optional(v.union(v.string(), v.null())),
  })
}),


  // Daily forecast
  daily: v.optional(v.object({
    data: v.array(v.object({
      date: v.string(), // ISO date string "2025-08-15"
      temperature: v.object({
        min: v.optional(v.number()), // minimum temperature
        max: v.optional(v.number()), // maximum temperature
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
  
  // Hourly forecast data
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
  
  // Additional derived analytics data
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

  // Metadata
  source: v.optional(v.string()), // API source identifier
  dataType: v.optional(v.union(
    v.literal("current"),
    v.literal("forecast"), 
    v.literal("current_and_forecast")
  )),
  createdAt: v.number(),
  expiresAt: v.optional(v.number()),
  query: v.optional(v.string()),
  requestType: v.optional(v.string())
})
  .index("by_user", ["userId"])
  .index("by_location", ["location.lat", "location.lon"])
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

  // Fields with crop areas for mapping
  fields: defineTable({
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
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"]),
});

export default schema;

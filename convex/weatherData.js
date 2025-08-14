// convex/weatherData.js
import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Upserts weather data for a given location and user.
 * Avoids duplicate hourly data and deduplicates daily forecasts.
 */
export const upsertWeatherData = mutation({
  args: {
    userId: v.id("users"),
    location: v.object({
      lat: v.number(),
      lon: v.number(),
      elevation: v.optional(v.number()),
      timezone: v.string()
    }),
    units: v.string(),
    current: v.object({
      timestamp: v.string(),
      temperature: v.number(),
      feelsLike: v.optional(v.union(v.number(), v.null())),
      humidity: v.optional(v.union(v.number(), v.null())),
      dewPoint: v.optional(v.union(v.number(), v.null())),
      pressure: v.optional(v.union(v.number(), v.null())),
      cloudCover: v.optional(v.union(v.number(), v.null())),
      uvIndex: v.optional(v.union(v.number(), v.null())),
      wind: v.object({
        speed: v.optional(v.union(v.number(), v.null())),
        direction: v.optional(v.union(v.number(), v.null()))
      }),
      precipitation: v.object({
        total: v.optional(v.union(v.number(), v.null())),
        probability: v.optional(v.union(v.number(), v.null())),
        type: v.optional(v.union(v.string(), v.null()))
      }),
      condition: v.object({
        summary: v.optional(v.union(v.string(), v.null())),
        icon: v.optional(v.union(v.string(), v.null())),
        code: v.union(v.number(), v.string(), v.null())
      }),
      sunlight: v.object({
        sunrise: v.optional(v.union(v.string(), v.null())),
        sunset: v.optional(v.union(v.string(), v.null()))
      })
    }),
    daily: v.optional(v.object({
      data: v.array(v.object({
        date: v.string(),
        temperature: v.object({
          min: v.optional(v.number()),
          max: v.optional(v.number())
        }),
        humidity: v.optional(v.object({
          min: v.optional(v.number()),
          max: v.optional(v.number())
        })),
        precipitation: v.optional(v.object({
          total: v.optional(v.number()),
          probability: v.optional(v.number())
        })),
        condition: v.optional(v.object({
          summary: v.optional(v.union(v.string(), v.null())),
          icon: v.optional(v.union(v.string(), v.null())),
          code: v.optional(v.union(v.string(), v.null()))
        })),
        sunlight: v.optional(v.object({
          sunrise: v.optional(v.union(v.string(), v.null())),
          sunset: v.optional(v.union(v.string(), v.null()))
        }))
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
        direction: v.optional(v.number())
      })),
      precipitation: v.optional(v.object({
        total: v.optional(v.number()),
        probability: v.optional(v.number())
      })),
      condition: v.optional(v.object({
        summary: v.optional(v.union(v.string(), v.null())),
        icon: v.optional(v.union(v.string(), v.null())),
        code: v.optional(v.union(v.string(), v.null()))
      }))
    }))),
    minutely: v.optional(v.array(v.any())),
    alerts: v.optional(v.array(v.any())),
    derived: v.optional(v.object({
      temperatureRange: v.optional(v.number()),
      pressureTrend: v.optional(v.object({ direction: v.string() })),
      humidityTrend: v.optional(v.object({ direction: v.string() })),
      windConsistency: v.optional(v.object({ averageSpeed: v.number() })),
      precipitationPattern: v.optional(v.object({ hoursWithRain: v.number() })),
      weatherStability: v.optional(v.object({ temperatureStability: v.string() })),
      seasonalContext: v.optional(v.object({ season: v.string() }))
    })),
    source: v.optional(v.string()),
    createdAt: v.number(),
    expiresAt: v.optional(v.number()),
    query: v.optional(v.string()),
    requestType: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // ===== 1️⃣ Handle current/hourly deduplication =====
    const existing = await ctx.db
      .query("weatherData")
      .withIndex("by_location", q =>
        q.eq("location.lat", args.location.lat)
         .eq("location.lon", args.location.lon)
      )
      .order("desc")
      .first();

    if (existing) {
      const oneHour = 3600000;
      const isSameHour = Math.abs(existing.createdAt - args.createdAt) < oneHour;

      if (isSameHour) {
        // Merge daily forecasts if needed
        const mergedDaily = mergeDailyForecasts(existing.daily, args.daily);
        await ctx.db.patch(existing._id, {
          ...args,
          daily: mergedDaily
        });
        return existing._id;
      }
    }

    // ===== 2️⃣ Insert as new record if not duplicate =====
    return await ctx.db.insert("weatherData", args);
  }
});

/**
 * Merges daily forecast data without duplicating the same date.
 * Keeps the most recent version for each day.
 */
function mergeDailyForecasts(existingDaily, newDaily) {
  if (!existingDaily?.data || !newDaily?.data) {
    return newDaily || existingDaily;
  }

  const dayMap = new Map();

  // Add existing days (use proper date field)
  for (const day of existingDaily.data) {
    dayMap.set(day.date, day);
  }

  // Overwrite with new data (latest forecast wins)
  for (const day of newDaily.data) {
    dayMap.set(day.date, day);
  }

  return { ...newDaily, data: Array.from(dayMap.values()) };
}
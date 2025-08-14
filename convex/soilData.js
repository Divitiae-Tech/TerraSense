// convex/soilAPIData.js
import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const getLatestByLocation = query({
  args: { lat: v.number(), lon: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("soilAPIData")
      .withIndex("by_location", q => 
        q.eq("location.lat", args.lat)
         .eq("location.lon", args.lon)
      )
      .order("desc")
      .first();
  }
});

export const insert = mutation({
  args: {
    location: v.object({ lat: v.number(), lon: v.number() }),
    data: v.any(),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("soilAPIData", args);
  }
});
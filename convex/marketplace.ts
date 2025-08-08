// convex/marketplace.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getMarketplaceListings = query({
  args: {
    category: v.optional(v.string()),
    location: v.optional(v.string()),
    maxDistance: v.optional(v.number()),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    organicOnly: v.optional(v.boolean()),
    searchQuery: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("marketplaceListings");

    const listings = await query
      .withIndex("by_available", (q) => q.eq("available", true))
      .order("desc")
      .take(args.limit || 50);

    let filteredListings = listings;

    // Apply filters
    if (args.category) {
      filteredListings = filteredListings.filter(listing => 
        listing.category.toLowerCase() === args.category!.toLowerCase()
      );
    }

    if (args.location) {
      filteredListings = filteredListings.filter(listing =>
        listing.location.toLowerCase().includes(args.location!.toLowerCase())
      );
    }

    if (args.minPrice) {
      filteredListings = filteredListings.filter(listing =>
        listing.pricePerUnit >= args.minPrice!
      );
    }

    if (args.maxPrice) {
      filteredListings = filteredListings.filter(listing =>
        listing.pricePerUnit <= args.maxPrice!
      );
    }

    if (args.organicOnly) {
      filteredListings = filteredListings.filter(listing =>
        listing.organicCertified === true
      );
    }

    if (args.searchQuery) {
      filteredListings = filteredListings.filter(listing =>
        listing.title.toLowerCase().includes(args.searchQuery!.toLowerCase()) ||
        listing.description?.toLowerCase().includes(args.searchQuery!.toLowerCase())
      );
    }

    return filteredListings;
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
    contactMethod: v.optional(v.union(
      v.literal("phone"),
      v.literal("email"),
      v.literal("platform_message")
    )),
  },
  handler: async (ctx, args) => {
    const totalPrice = args.quantity * args.pricePerUnit;
    
    const listingId = await ctx.db.insert("marketplaceListings", {
      ...args,
      totalPrice,
      available: true,
      views: 0,
      createdAt: Date.now(),
    });

    return listingId;
  },
});
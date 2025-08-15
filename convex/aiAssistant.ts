import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const processAIRequest = mutation({
  args: {
    userId: v.id("users"),
    message: v.string(),
    action: v.optional(v.string()),
    data: v.optional(v.any())
  },
  handler: async (ctx, { userId, message, action, data }) => {
    await ctx.db.insert("aiConversations", {
      userId,
      role: "user",
      content: message,
      timestamp: Date.now(),
    });
    
    let response = "I understand you need help with farming. Let me analyze your data.";
    let actionResult = null;

    if (action && data) {
      try {
        switch (action) {
          case "create_crop":
            actionResult = await ctx.db.insert("crops", {
              userId,
              ...data,
              createdAt: Date.now(),
            });
            response = `Successfully created crop: ${data.name}`;
            break;
          case "create_soil_data":
            actionResult = await ctx.db.insert("soilData", {
              userId,
              ...data,
              createdAt: Date.now(),
            });
            response = "Soil data recorded successfully";
            break;
          case "create_plant_image":
            actionResult = await ctx.db.insert("plantImages", {
              userId,
              ...data,
              uploadedAt: Date.now(),
            });
            response = "Plant image analysis completed";
            break;
          case "create_harvest":
            actionResult = await ctx.db.insert("harvests", {
              userId,
              ...data,
              createdAt: Date.now(),
            });
            response = "Harvest data recorded successfully";
            break;
          case "create_marketplace_listing":
            actionResult = await ctx.db.insert("marketplaceListings", {
              userId,
              ...data,
              createdAt: Date.now(),
            });
            response = "Marketplace listing created successfully";
            break;
          case "create_weather_data":
            actionResult = await ctx.db.insert("weatherData", {
              userId,
              ...data,
              createdAt: Date.now(),
            });
            response = "Weather data updated";
            break;
          case "create_recommendation":
            actionResult = await ctx.db.insert("recommendations", {
              userId,
              ...data,
              status: "pending",
              createdAt: Date.now(),
            });
            response = "New recommendation added";
            break;
          case "create_equipment":
            actionResult = await ctx.db.insert("equipment", {
              userId,
              ...data,
              createdAt: Date.now(),
            });
            response = `Equipment ${data.name} added to your inventory`;
            break;
          case "create_water_usage":
            actionResult = await ctx.db.insert("waterUsage", {
              userId,
              ...data,
              createdAt: Date.now(),
            });
            response = "Water usage data recorded";
            break;
          case "create_seed_stock":
            actionResult = await ctx.db.insert("seedStock", {
              userId,
              ...data,
              createdAt: Date.now(),
            });
            response = `Successfully added ${data.name} to your seed stock`;
            break;
          case "update_seed_stock":
            await ctx.db.patch(data.id, {
              ...data.updates,
              lastUpdated: Date.now(),
            });
            response = `Seed stock updated successfully`;
            break;
          case "adjust_stock":
            const stockItem = await ctx.db.get(data.id);
            if (!stockItem || stockItem === null) {
              throw new Error("Stock item not found");
            }
            // Type guard to ensure we have a seedStock item
            if (!('currentStock' in stockItem) || !('name' in stockItem) || !('unit' in stockItem)) {
              throw new Error("Invalid stock item type");
            }
            const newStock = Math.max(0, (stockItem as any).currentStock + data.adjustment);
            await ctx.db.patch(data.id, {
              currentStock: newStock,
              lastUpdated: Date.now(),
              notes: data.notes || (stockItem as any).notes,
            });
            response = `Stock adjusted. ${(stockItem as any).name} now has ${newStock} ${(stockItem as any).unit}`;
            break;
          case "delete_seed_stock":
            const itemToDelete = await ctx.db.get(data.id);
            if (!itemToDelete) {
              throw new Error("Seed stock item not found");
            }
            await ctx.db.delete(data.id);
            response = `Successfully removed ${(itemToDelete as any).name} from your seed stock`;
            break;
          case "update_crop_dates":
            await ctx.db.patch(data.id, {
              plantingDate: data.plantingDate,
              expectedHarvestDate: data.expectedHarvestDate,
              updatedAt: Date.now(),
            });
            response = "Crop planting and harvest dates updated";
            break;
          case "update_record":
            await ctx.db.patch(data.id, data.updates);
            response = "Record updated successfully";
            break;
          case "delete_record":
            await ctx.db.delete(data.id);
            response = "Record deleted successfully";
            break;
          default:
            response = "Action not recognized. Available actions: create_crop, create_soil_data, create_plant_image, create_harvest, create_marketplace_listing, create_weather_data, create_recommendation, create_equipment, create_water_usage, create_seed_stock, update_seed_stock, adjust_stock, delete_seed_stock, update_crop_dates, update_record, delete_record";
        }
      } catch (error) {
        response = `Error performing action: ${error}`;
      }
    }

    await ctx.db.insert("aiConversations", {
      userId,
      role: "assistant",
      content: response,
      timestamp: Date.now(),
    });
    
    return { response, actionResult };
  },
});

export const getUserContext = query({
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

export const getConversationHistory = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("aiConversations")
      .withIndex("by_user", q => q.eq("userId", userId))
      .order("asc")
      .collect();
  },
});

export const storeConversationMessage = mutation({
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
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse, NextRequest } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

// Add this interface definition
interface Message {
    role: 'user' | 'model';
    text: string;
}

// IMPORTANT: Do NOT use NEXT_PUBLIC_ here.
// This is a server-side file, so the key is kept private.
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY in .env.local");
}

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const genAI = new GoogleGenerativeAI(apiKey);

/**
 * This is the new server-side handler for your AI chat.
 * It receives a request from your frontend, securely calls the Gemini API,
 * and streams the response back.
 */
export async function POST(request: NextRequest) {
    try {
        // Get the user's prompt and history from the request body.
        const { prompt, history }: { prompt: string; history: Message[] } = await request.json();

        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        // Get the authenticated user
        const auth = getAuth(request);
        console.log("Auth object:", auth);
        if (!auth.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get the user's Convex ID
        const user = await convex.query(api.users.getUserByClerkId, { clerkId: auth.userId });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const userId = user._id;

        // Store the user's message in Convex
        await convex.mutation(api.database.storeConversation, {
            userId,
            role: "user",
            content: prompt,
        });

        // Get all user farming data to provide context to the AI
        const userData = await convex.query(api.aiAssistant.getUserContext, { userId });
        const { crops, soilData, weatherData, recommendations, seedStock } = userData;

        // Create a contextual system instruction for the AI
        const contextualInstruction = `
        You are an AI farming assistant specializing in agricultural guidance and support.
        You can engage in professional greetings, small talk, and appropriate conversational exchanges.
        However, your primary expertise is farming and agriculture. If users ask complex questions outside of farming,
        politely redirect them back to agricultural topics where you can provide the most value.
        
        You are also required to be able to generate schedules for a crop calendar and a harvest plan for farming.
        
        You can also help users add new crops to their farm records. When a user asks to add crops,
        you should respond with a special format that will be processed by the system:
        [ADD_CROPS]crop1,crop2,crop3[/ADD_CROPS]
        For example: [ADD_CROPS]wheat,carrots[/ADD_CROPS]
        
        You can also help users update their crop calendar visualization. When a user asks to add or remove crops from the calendar,
        you should respond with a special format that will be processed by the system:
        [UPDATE_CALENDAR]add:crop1,crop2|remove:crop3[/UPDATE_CALENDAR]
        For example: [UPDATE_CALENDAR]add:wheat,carrots|remove:New Crop 4[/UPDATE_CALENDAR]
        
        IMPORTANT: When removing crops, always use the crop NAME (e.g., "New Crop 4", "wheat", "carrots"), NOT the database ID. The system will handle finding the correct crop in the database.
        
        You can also help users manage their seed stock inventory. When a user asks to add seeds or supplies to their inventory,
        you should respond with a special format that will be processed by the system:
        [ADD_SEED_STOCK]name:type:currentStock:maxCapacity:unit[/ADD_SEED_STOCK]
        For example: [ADD_SEED_STOCK]Tomato Seeds:seeds:50:100:packets[/ADD_SEED_STOCK]
        
        When a user asks to adjust existing stock (add or use seeds), use this format:
        [ADJUST_STOCK]stockId:adjustment:notes[/ADJUST_STOCK]
        For example: [ADJUST_STOCK]abc123:+25:Purchased new seeds[/ADJUST_STOCK] or [ADJUST_STOCK]abc123:-10:Used for planting[/ADJUST_STOCK]
        
        IMPORTANT: When adjusting stock, always use the exact stock ID from the seed stock context. The adjustment can be positive (adding) or negative (using/removing).
        For "change from X to Y", calculate the difference: if current is 0 and target is 40, use +40.
        
        When a user asks to delete or remove a seed stock item entirely, use this format:
        [DELETE_SEED_STOCK]stockId[/DELETE_SEED_STOCK]
        For example: [DELETE_SEED_STOCK]abc123[/DELETE_SEED_STOCK]
        
        If the user asks to initialize or set up their seed stock with basic items, use:
        [INIT_SEED_STOCK][/INIT_SEED_STOCK]
        
        Here is the user's farming context:
        - Crops: ${crops.map(c => `${c._id}: ${c.name} (${c.type}) - Planting: ${c.plantingDate || 'Not set'}, Harvest: ${c.expectedHarvestDate || 'Not set'}`).join(', ') || 'None registered'}
        - Soil Data: ${soilData.length} soil tests recorded
        - Weather Data: ${weatherData.length} weather records
        - Recommendations: ${recommendations.length} active recommendations
        - Seed Stock: ${seedStock.map(s => `${s._id}: ${s.name} (${s.currentStock}/${s.maxCapacity} ${s.unit})`).join(', ') || 'No stock items'}
        
        When generating or updating crop calendars, you must use the actual Convex ID for the crop, not the crop name. The format for crop IDs is like "crp_1234567890abcdef". You can find the crop IDs in the user's farming context above.
        
        
        When users ask about crop schedules or calendars, you can help them update their crop planting and harvest dates directly. The system will automatically display these dates in the crop calendar visualization based on optimal seasonal timing for each crop type.
        
        Only generate brief, concise information that is accurate. Use a professional tone and format. 
        
        FORMATTING RULES:
        - Keep responses short and to the point (2-4 sentences maximum unless providing specific schedules)
        - Do not use asterisks (*) or bullet points in responses
        - Hyphens (-) are allowed for organizing text and lists
        - Use simple numbered lists (1., 2., 3.) or hyphens for listing when necessary
        - Avoid unnecessary symbols or markdown formatting
        - Be professional and direct in your language
        
        CONTEXT USAGE:
        - ALWAYS reference the user's specific crops, soil data, weather conditions, and other farming context when providing advice
        - Do not give generic advice - tailor responses to their actual farm situation
        - Use the crop names, planting dates, and other specific details from their context
        - If they have no crops or data, mention that they should add some first
        `;
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: contextualInstruction,
        });

        // Transform the incoming history to the format the SDK expects
        const chatHistory = history.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.text }],
        }));

        const chat = model.startChat({
            history: chatHistory,
        });

        const result = await chat.sendMessage(prompt);
        const response = result.response;
        let text = response.text().trim();

        // Check if the response contains the special format for adding crops
        const addCropsRegex = /\[ADD_CROPS\](.*?)\[\/ADD_CROPS\]/;
        const match = text.match(addCropsRegex);
        
        if (match) {
            // Extract crop names from the match
            const cropNames = match[1].split(',').map(name => name.trim()).filter(name => name);
            
            // Add each crop to the database
            const addedCrops = [];
            for (const cropName of cropNames) {
                try {
                    const cropId = await convex.mutation(api.database.createCrop, {
                        userId,
                        name: cropName,
                        type: cropName.toLowerCase(),
                        status: "planned",
                    });
                    addedCrops.push(cropName);
                } catch (error) {
                    console.error(`Error adding crop ${cropName}:`, error);
                }
            }
            
            // Remove the special format from the response text
            text = text.replace(addCropsRegex, '').trim();
            
            // Add a confirmation message to the response
            if (addedCrops.length > 0) {
                text += (text ? '\n\n' : '') + `I've added the following crops to your farm records: ${addedCrops.join(', ')}.`;
            }
        }
        
        // Check if the response contains the special format for updating calendar
        const updateCalendarRegex = /\[UPDATE_CALENDAR\](.*?)\[\/UPDATE_CALENDAR\]/;
        const calendarMatch = text.match(updateCalendarRegex);
        
        if (calendarMatch) {
            // Extract add/remove operations from the match
            const operations = calendarMatch[1].split('|');
            const addOperation = operations.find(op => op.startsWith('add:'));
            const removeOperation = operations.find(op => op.startsWith('remove:'));
            
            const addedCrops = addOperation ? addOperation.substring(4).split(',').map(name => name.trim()).filter(name => name) : [];
            const removedCrops = removeOperation ? removeOperation.substring(7).split(',').map(name => name.trim()).filter(name => name) : [];
            
            // Actually remove crops from the database
            const actuallyRemovedCrops = [];
            for (const cropIdentifier of removedCrops) {
                try {
                    // Find the crop in the database - it could be a name or an ID
                    let cropToDelete;
                    if (cropIdentifier.length > 20 && cropIdentifier.startsWith('j')) {
                        // This looks like a Convex ID
                        cropToDelete = crops.find((crop: any) => crop._id === cropIdentifier);
                    } else {
                        // This is a crop name
                        cropToDelete = crops.find((crop: any) => 
                            crop.name.toLowerCase() === cropIdentifier.toLowerCase()
                        );
                    }
                    
                    if (cropToDelete) {
                        await convex.mutation(api.database.deleteRecord, {
                            id: cropToDelete._id,
                        });
                        actuallyRemovedCrops.push(cropToDelete.name);
                    }
                } catch (error) {
                    console.error(`Error removing crop ${cropIdentifier}:`, error);
                }
            }
            
            // Add new crops to the database
            const actuallyAddedCrops = [];
            for (const cropName of addedCrops) {
                try {
                    await convex.mutation(api.database.createCrop, {
                        userId,
                        name: cropName,
                        type: cropName.toLowerCase(),
                        status: "planned",
                    });
                    actuallyAddedCrops.push(cropName);
                } catch (error) {
                    console.error(`Error adding crop ${cropName}:`, error);
                }
            }
            
            // Remove the special format from the response text
            text = text.replace(updateCalendarRegex, '').trim();
            
            // Add a confirmation message to the response
            const changes = [];
            if (actuallyAddedCrops.length > 0) {
                changes.push(`added to calendar: ${actuallyAddedCrops.join(', ')}`);
            }
            if (actuallyRemovedCrops.length > 0) {
                changes.push(`removed from calendar: ${actuallyRemovedCrops.join(', ')}`);
            }
            
            if (changes.length > 0) {
                text += (text ? '\n\n' : '') + `I've ${changes.join(' and ')} in your crop calendar.`;
            }
        }
        
        
        // Check if the response contains the special format for adding seed stock
        const addSeedStockRegex = /\[ADD_SEED_STOCK\](.*?)\[\/ADD_SEED_STOCK\]/;
        const seedStockMatch = text.match(addSeedStockRegex);
        
        if (seedStockMatch) {
            try {
                // Extract seed stock data from the match
                const parts = seedStockMatch[1].split(':');
                if (parts.length >= 5) {
                    const [name, type, currentStock, maxCapacity, unit] = parts;
                    
                    // Add the seed stock item to the database
                    await convex.mutation(api.database.createSeedStock, {
                        userId,
                        name: name.trim(),
                        type: type.trim() as any,
                        currentStock: parseInt(currentStock.trim()),
                        maxCapacity: parseInt(maxCapacity.trim()),
                        unit: unit.trim(),
                    });
                    
                    // Remove the special format from the response text
                    text = text.replace(addSeedStockRegex, '').trim();
                    
                    // Add a confirmation message to the response
                    text += (text ? '\n\n' : '') + `I've added ${name} to your seed stock inventory with ${currentStock} ${unit} out of ${maxCapacity} ${unit} capacity.`;
                } else {
                    throw new Error("Invalid seed stock format");
                }
            } catch (error) {
                console.error("Error adding seed stock:", error);
                text += (text ? '\n\n' : '') + `Sorry, I encountered an error while adding the seed stock. Please try again.`;
            }
        }
        
        // Check if the response contains the special format for adjusting stock
        const adjustStockRegex = /\[ADJUST_STOCK\](.*?)\[\/ADJUST_STOCK\]/;
        const adjustStockMatch = text.match(adjustStockRegex);
        
        if (adjustStockMatch) {
            // Extract adjustment data from the match
            const parts = adjustStockMatch[1].split(':');
            try {
                if (parts.length >= 3) {
                    const [stockId, adjustmentStr, notes] = parts;
                    const adjustment = parseInt(adjustmentStr.trim());
                    
                    // Adjust the stock using the dedicated function
                    await convex.mutation(api.database.adjustStock, {
                        id: stockId.trim() as any,
                        adjustment,
                        notes: notes?.trim() || undefined,
                    });
                    
                    // Get the updated stock item for confirmation message using getSeedStock
                    const allSeedStock = await convex.query(api.database.getSeedStock, { userId });
                    const currentItem = allSeedStock.find((item: any) => item._id === stockId.trim());
                    
                    // Remove the special format from the response text
                    text = text.replace(adjustStockRegex, '').trim();
                    
                    // Add a confirmation message to the response
                    const action = adjustment > 0 ? 'added' : 'used';
                    if (currentItem) {
                        text += (text ? '\n\n' : '') + `I've ${action} ${Math.abs(adjustment)} ${currentItem.unit} for ${currentItem.name}. New stock level: ${currentItem.currentStock} ${currentItem.unit}.`;
                    } else {
                        text += (text ? '\n\n' : '') + `I've ${action} ${Math.abs(adjustment)} units from your stock inventory.`;
                    }
                } else {
                    throw new Error("Invalid stock adjustment format");
                }
            } catch (error) {
                console.error("Error adjusting stock:", error);
                console.error("Stock adjustment details:", { 
                    stockId: parts[0]?.trim(), 
                    adjustment: parts[1]?.trim(), 
                    notes: parts[2]?.trim(),
                    matchedText: adjustStockMatch[1] 
                });
                text += (text ? '\n\n' : '') + `Sorry, I encountered an error while adjusting the stock: ${error instanceof Error ? error.message : String(error)}. Please try again.`;
            }
        }
        
        // Check if the response contains the special format for initializing seed stock
        const initSeedStockRegex = /\[INIT_SEED_STOCK\]\[\/INIT_SEED_STOCK\]/;
        const initSeedStockMatch = text.match(initSeedStockRegex);
        
        if (initSeedStockMatch) {
            try {
                // Initialize seed stock for the user
                const result = await convex.mutation(api.database.initializeSeedStockForUser, {
                    userId,
                });
                
                // Remove the special format from the response text
                text = text.replace(initSeedStockRegex, '').trim();
                
                // Add a confirmation message to the response
                if (result.count) {
                    text += (text ? '\n\n' : '') + `I've initialized your seed stock with ${result.count} basic items including tomato seeds, corn seeds, wheat seeds, organic fertilizer, and pesticide.`;
                } else {
                    text += (text ? '\n\n' : '') + `You already have seed stock items in your inventory.`;
                }
            } catch (error) {
                console.error("Error initializing seed stock:", error);
                text += (text ? '\n\n' : '') + `Sorry, I encountered an error while setting up your seed stock. Please try again.`;
            }
        }
        
        // Check if the response contains the special format for deleting seed stock
        const deleteSeedStockRegex = /\[DELETE_SEED_STOCK\](.*?)\[\/DELETE_SEED_STOCK\]/;
        const deleteSeedStockMatch = text.match(deleteSeedStockRegex);
        
        if (deleteSeedStockMatch) {
            try {
                const stockId = deleteSeedStockMatch[1].trim();
                
                // Get the seed stock item first to get its name for confirmation
                const allSeedStock = await convex.query(api.database.getSeedStock, { userId });
                const itemToDelete = allSeedStock.find((item: any) => item._id === stockId);
                
                if (!itemToDelete) {
                    throw new Error("Seed stock item not found");
                }
                
                // Delete the seed stock item
                await convex.mutation(api.database.deleteRecord, {
                    id: stockId,
                });
                
                // Remove the special format from the response text
                text = text.replace(deleteSeedStockRegex, '').trim();
                
                // Add a confirmation message to the response
                text += (text ? '\n\n' : '') + `I've successfully removed ${itemToDelete.name} from your seed stock inventory.`;
            } catch (error) {
                console.error("Error deleting seed stock:", error);
                console.error("Delete seed stock details:", { 
                    stockId: deleteSeedStockMatch[1]?.trim(),
                    matchedText: deleteSeedStockMatch[1] 
                });
                text += (text ? '\n\n' : '') + `Sorry, I encountered an error while deleting the seed stock item: ${error instanceof Error ? error.message : String(error)}. Please try again.`;
            }
        }

        // Store the AI's response in Convex
        await convex.mutation(api.database.storeConversation, {
            userId,
            role: "assistant",
            content: text,
        });

        // Send the AI's response back to the frontend.
        return NextResponse.json({ text });

    } catch (error: any) {
        console.error("Error in API route:", error);
        // Send a more generic error message to the client for security.
        return NextResponse.json({ error: "Failed to fetch AI response." }, { status: 500 });
    }
}

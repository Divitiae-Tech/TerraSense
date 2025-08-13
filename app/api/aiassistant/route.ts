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
        await convex.mutation(api.aiAssistant.storeConversationMessage, {
            userId,
            role: "user",
            content: prompt,
        });

        // Get relevant farming data to provide context to the AI
        const [crops, soilData, weatherData, calendars, recommendations] = await Promise.all([
            convex.query(api.aiAssistant.getUserCrops, { userId }),
            convex.query(api.aiAssistant.getUserSoilData, { userId }),
            convex.query(api.aiAssistant.getUserWeatherData, { userId }),
            convex.query(api.aiAssistant.getUserCropCalendars, { userId }),
            convex.query(api.aiAssistant.getUserRecommendations, { userId }),
        ]);

        // Create a contextual system instruction for the AI
        const contextualInstruction = `
        You are an AI farming assistant. Only answer questions related to farming.
        If the user asks anything that is not relevant to farming, you must tell them
        'Sorry I cannot answer that question, please ask a question that is related to farming'.
        
        You are also required to be able to generate schedules for a crop calendar and a harvest plan for farming.
        
        You can also help users add new crops to their farm records. When a user asks to add crops,
        you should respond with a special format that will be processed by the system:
        [ADD_CROPS]crop1,crop2,crop3[/ADD_CROPS]
        For example: [ADD_CROPS]wheat,carrots[/ADD_CROPS]
        
        You can also help users update their crop calendar visualization. When a user asks to add or remove crops from the calendar,
        you should respond with a special format that will be processed by the system:
        [UPDATE_CALENDAR]add:crop1,crop2|remove:crop3[/UPDATE_CALENDAR]
        For example: [UPDATE_CALENDAR]add:wheat,carrots|remove:corn[/UPDATE_CALENDAR]
        
        Here is the user's farming context:
        - Crops: ${crops.map(c => `${c._id}: ${c.name} (${c.type})`).join(', ') || 'None registered'}
        - Soil Data: ${soilData.length} soil tests recorded
        - Weather Data: ${weatherData.length} weather records
        - Crop Calendars: ${calendars.length} calendars with detailed schedules
        - Recommendations: ${recommendations.length} active recommendations
        
        When generating or updating crop calendars, you must use the actual Convex ID for the crop, not the crop name. The format for crop IDs is like "crp_1234567890abcdef". You can find the crop IDs in the user's farming context above.
        
        
        When generating or updating crop calendars, you can use the following format:
        [CROP_CALENDAR]cropId:season:[{"date":"YYYY-MM-DD","action":"planting","description":"Plant seeds","completed":false}][/CROP_CALENDAR]
        
        Important: When generating the schedule JSON, make sure to use double quotes for all strings and property names. Do not use single quotes or any other formatting that could break the JSON structure. The schedule should be a valid JSON array of objects with the following properties:
        - date: ISO date string (YYYY-MM-DD)
        - action: string (planting, fertilizing, watering, pesticide, harvesting)
        - description: optional string
        - completed: boolean
        - weather: optional object with temperature, rainfall, humidity properties
        - reminder: optional string
        - cost: optional number
        
        When generating a complete crop calendar, you should include all relevant actions for the crop throughout its growing season. For example:
        [CROP_CALENDAR]crp_1234567890abcdef:2024-spring:[{"date":"2024-03-15","action":"planting","description":"Plant seeds","completed":false},{"date":"2024-03-22","action":"watering","description":"Water seeds","completed":false},{"date":"2024-04-05","action":"fertilizing","description":"Apply fertilizer","completed":false},{"date":"2024-06-15","action":"harvesting","description":"Harvest crop","completed":false}][/CROP_CALENDAR]
        
        When a user requests to populate the crop calendar with specific crops, you should generate a detailed schedule for each crop based on best farming practices. The schedule should include all relevant actions for the crop throughout its growing season, such as planting, watering, fertilizing, pest control, and harvesting. Make sure to include appropriate dates for each action based on the crop type and season.
        
        Only generate brief, concise information that is accurate. Do not use any symbols that could mess up formatting such as hyphens.
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
        let text = response.text();

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
                    const cropId = await convex.mutation(api.aiAssistant.addCrop, {
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
                text += `\n\nI've added the following crops to your farm records: ${addedCrops.join(', ')}.`;
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
            
            // Remove the special format from the response text
            text = text.replace(updateCalendarRegex, '').trim();
            
            // Add a confirmation message to the response
            const changes = [];
            if (addedCrops.length > 0) {
                changes.push(`added to calendar: ${addedCrops.join(', ')}`);
            }
            if (removedCrops.length > 0) {
                changes.push(`removed from calendar: ${removedCrops.join(', ')}`);
            }
            
            if (changes.length > 0) {
                text += `\n\nI've ${changes.join(' and ')} in your crop calendar.`;
            }
        }
        
        // Check if the response contains the special format for crop calendar updates
        const cropCalendarRegex = /\[CROP_CALENDAR\](.*?)\[\/CROP_CALENDAR\]/;
        const cropCalendarMatch = text.match(cropCalendarRegex);
        
        if (cropCalendarMatch) {
            try {
                // Extract crop calendar data from the match
                // Extract cropId, season, and scheduleJson using regex
                const cropCalendarRegexPattern = /^([^:]+):([^:]+):(.*)$/;
                const cropCalendarParts = cropCalendarMatch[1].match(cropCalendarRegexPattern);
                
                if (!cropCalendarParts || cropCalendarParts.length < 4) {
                    throw new Error("Invalid crop calendar format");
                }
                
                const cropId = cropCalendarParts[1];
                const season = cropCalendarParts[2];
                const scheduleJson = cropCalendarParts[3];
                
                // Parse the schedule JSON
                const schedule = JSON.parse(scheduleJson);
                
                // Update the crop calendar in the database
                await convex.mutation(api.aiAssistant.populateCropCalendar, {
                    userId,
                    cropId: cropId as any,
                    season,
                    schedule,
                });
                
                // Remove the special format from the response text
                text = text.replace(cropCalendarRegex, '').trim();
                
                // Add a confirmation message to the response
                text += `\n\nI've updated the crop calendar for ${cropId} for the ${season} season.`;
            } catch (error) {
                console.error("Error updating crop calendar:", error);
                // Add an error message to the response
                text += `\n\nSorry, I encountered an error while updating the crop calendar. Please try again.`;
            }
        }

        // Store the AI's response in Convex
        await convex.mutation(api.aiAssistant.storeConversationMessage, {
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

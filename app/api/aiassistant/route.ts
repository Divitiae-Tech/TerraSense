import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

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

const genAI = new GoogleGenerativeAI(apiKey);

/**
 * This is the new server-side handler for your AI chat.
 * It receives a request from your frontend, securely calls the Gemini API,
 * and streams the response back.
 */
export async function POST(request: Request) {
    try {
        // Get the user's prompt and history from the request body.
        const { prompt, history }: { prompt: string; history: Message[] } = await request.json();

        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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
        const text = response.text();

        // Send the AI's response back to the frontend.
        return NextResponse.json({ text });

    } catch (error: any) {
        console.error("Error in API route:", error);
        // Send a more generic error message to the client for security.
        return NextResponse.json({ error: "Failed to fetch AI response." }, { status: 500 });
    }
}

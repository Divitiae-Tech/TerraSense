import { useState } from 'react';

// Helper to replace crop IDs with crop names in AI messages
function replaceCropIdsWithNames(text: string, crops: any[]): string {
    if (!crops || crops.length === 0) return text;
    // Find all crop IDs in the text (format: j97... or crp_...)
    const cropIdRegex = /\b([a-z]{3,4}_[a-z0-9]{16,}|j[0-9a-z]{24,})\b/g;
    return text.replace(cropIdRegex, (id) => {
        const crop = crops.find((c: any) => c._id === id);
        return crop ? crop.name.charAt(0).toUpperCase() + crop.name.slice(1).toLowerCase() : id;
    });
}

export interface Message {
    role: 'user' | 'model';
    text: string;
}

/**
 * A simplified hook that manages chat state locally and communicates
 * with our secure Next.js API route.
 */
export const useAIAssistant = (crops: any[] = []) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const callApiRoute = async (prompt: string, currentHistory: Message[]) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/aiassistant', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt, history: currentHistory }),
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "An unknown error occurred.");
            }

            const { text } = await response.json();
            // Replace crop IDs with names before displaying
            const replacedText = replaceCropIdsWithNames(text, crops);
            setMessages(prev => [...prev, { role: 'model', text: replacedText }]);

        } catch (e: any) {
            console.error("Error calling API route:", e);
            setError(`Failed to get a response. Error: ${e.message}`);
            setMessages(prev => prev.slice(0, -1));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (prompt: string) => {
        if (!prompt.trim() || isLoading) return;

        const newUserMessage: Message = { role: 'user', text: prompt };
        const currentHistory = [...messages, newUserMessage];

        setMessages(currentHistory);
        callApiRoute(prompt, messages);
    };

    const parseCalendarUpdate = (text: string) => {
        const updateCalendarRegex = /\[UPDATE_CALENDAR\](.*?)\[\/UPDATE_CALENDAR\]/;
        const calendarMatch = text.match(updateCalendarRegex);

        if (calendarMatch) {
            const operations = calendarMatch[1].split('|');
            const addOperation = operations.find(op => op.startsWith('add:'));
            const removeOperation = operations.find(op => op.startsWith('remove:'));

            const addedCrops = addOperation ? addOperation.substring(4).split(',').map(name => name.trim()).filter(name => name) : [];
            const removedCrops = removeOperation ? removeOperation.substring(7).split(',').map(name => name.trim()).filter(name => name) : [];

            return { addedCrops, removedCrops };
        }

        return { addedCrops: [], removedCrops: [] };
    };

    return {
        messages,
        isLoading,
        error,
        handleSubmit,
        parseCalendarUpdate,
    };
};
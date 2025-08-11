import { useState } from 'react';

export interface Message {
    role: 'user' | 'model';
    text: string;
}

/**
 * A simplified hook that manages chat state locally and communicates
 * with our secure Next.js API route.
 */
export const useAIAssistant = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const callApiRoute = async (prompt: string, currentHistory: Message[]) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/aiassistant', { // Ensure this path is correct
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt, history: currentHistory }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "An unknown error occurred.");
            }

            const { text } = await response.json();
            setMessages(prev => [...prev, { role: 'model', text }]);

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
        callApiRoute(prompt, messages); // Send history before the new user message
    };

    return {
        messages,
        isLoading,
        error,
        handleSubmit,
    };
};
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAIAssistant, Message } from '../../hooks/useAIAssistant';

// The modal now accepts props to control its state
interface AIAssistantModalProps {
    isOpen: boolean;
    onClose: () => void;
    aiPrompts: string[];
    messages?: Message[];
    isLoading?: boolean;
    error?: string | null;
    handleSubmit?: (prompt: string) => void;
}

export const AIAssistantModal = ({ isOpen, onClose, aiPrompts, messages: propMessages, isLoading: propIsLoading, error: propError, handleSubmit: propHandleSubmit }: AIAssistantModalProps) => {
    const [userInput, setUserInput] = useState('');
    
    // Always call the hook to maintain consistent order
    const { messages: localMessages, isLoading: localIsLoading, error: localError, handleSubmit: localHandleSubmit } = useAIAssistant();
    
    // Use shared state when provided, otherwise use local hook
    const isUsingSharedState = propMessages !== undefined && propIsLoading !== undefined && propError !== undefined && propHandleSubmit !== undefined;
    const messages = isUsingSharedState ? propMessages : localMessages;
    const isLoading = isUsingSharedState ? propIsLoading : localIsLoading;
    const error = isUsingSharedState ? propError : localError;
    const originalHandleSubmit = isUsingSharedState ? propHandleSubmit : localHandleSubmit;
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // The modal only renders if the isOpen prop is true
    if (!isOpen) {
        return null;
    }

    const handleSubmit = (prompt: string) => {
        originalHandleSubmit(prompt);
    };

    const handlePromptSubmit = () => {
        if (userInput.trim()) {
            handleSubmit(userInput);
            setUserInput('');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose} // Use the onClose prop to close the modal
            ></div>

            {/* Modal Panel */}
            <div className="relative z-10 w-full max-w-2xl h-[80vh] bg-white dark:bg-gray-900 rounded-lg shadow-2xl flex flex-col">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center space-x-2">
                        <span className="font-semibold">AI Assistant</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="rounded-full"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>
                
                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 && !isLoading && (
                        <div className="text-center text-gray-500">
                            <p className="mb-4">Ask a question to start a conversation.</p>
                            <div className="space-y-2">
                                {aiPrompts.map((prompt, index) => (
                                    <Button
                                        key={index}
                                        variant="outline"
                                        className="w-full justify-start text-left h-auto p-3 whitespace-normal"
                                        onClick={() => handleSubmit(prompt)}
                                    >
                                        {prompt}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start space-x-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                            <div className={`px-4 py-2 rounded-lg max-w-lg ${msg.role === 'user' ? 'bg-purple-600 text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-800 rounded-bl-none'}`}>
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex items-center space-x-3">
                            <div className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-800">
                                <div className="h-5 w-5 text-gray-500 animate-spin">Loading...</div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="text-red-500 p-3 bg-red-100 dark:bg-red-900/20 rounded-lg text-sm">
                            <strong>Error:</strong> {error}
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t">
                    <div className="flex space-x-2">
                        <Input
                            type="text"
                            placeholder="Ask AI anything..."
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handlePromptSubmit()}
                            disabled={isLoading}
                        />
                        <Button
                            size="icon"
                            onClick={handlePromptSubmit}
                            disabled={!userInput.trim() || isLoading}
                        >
                            Send
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

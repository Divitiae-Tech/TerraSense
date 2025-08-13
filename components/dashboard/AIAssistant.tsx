'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Bot, User, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAIAssistant, Message } from '../../hooks/useAIAssistant';

interface AIAssistantProps {
  aiPrompts: string[];
  onFirstInteraction?: () => void;
  messages?: Message[];
  isLoading?: boolean;
  error?: string | null;
  handleSubmit?: (prompt: string) => void;
}

export const AIAssistant = ({ aiPrompts, onFirstInteraction, messages: propMessages, isLoading: propIsLoading, error: propError, handleSubmit: propHandleSubmit }: AIAssistantProps) => {
  const [userInput, setUserInput] = useState('');

  // Use shared state when provided, otherwise use local hook
  const isUsingSharedState = propMessages !== undefined && propIsLoading !== undefined && propError !== undefined && propHandleSubmit !== undefined;
  const { messages, isLoading, error, handleSubmit: originalHandleSubmit } = isUsingSharedState
    ? { messages: propMessages!, isLoading: propIsLoading!, error: propError!, handleSubmit: propHandleSubmit! }
    : useAIAssistant();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (prompt: string) => {
    originalHandleSubmit(prompt);
    if (onFirstInteraction && !isUsingSharedState) {
      onFirstInteraction();
    }
  };

  const handlePromptSubmit = () => {
    if (userInput.trim()) {
      handleSubmit(userInput);
      setUserInput('');
    }
  };

  return (
    // The Card now has h-full to ensure it fills the modal's height
    <Card className="flex flex-col h-full h-80 shadow-lg overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5 text-purple-500" />
          <span>AI Assistant</span>
        </CardTitle>
      </CardHeader>

      {/* This CardContent is a flex container that grows to fill available space */}
      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        {/* This is the key change: This div will now scroll */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 h-full">

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
              {msg.role === 'model' && <Bot className="h-6 w-6 text-purple-500 flex-shrink-0" />}
              <div className={`px-4 py-2 rounded-lg max-w-lg ${msg.role === 'user' ? 'bg-purple-600 text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-800 rounded-bl-none'}`}>
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
              {msg.role === 'user' && <User className="h-6 w-6 text-gray-500 flex-shrink-0" />}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center space-x-3">
              <Bot className="h-6 w-6 text-purple-500 flex-shrink-0 animate-pulse" />
              <div className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-800">
                <Loader2 className="h-5 w-5 text-gray-500 animate-spin" />
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

        {/* The input area is now fixed at the bottom */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
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
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
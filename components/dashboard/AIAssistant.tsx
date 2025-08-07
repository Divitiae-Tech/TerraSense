'use client';

import React, { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AIAssistantProps {
  aiPrompts: string[];
}

export const AIAssistant = ({ aiPrompts }: AIAssistantProps) => {
  const [aiPrompt, setAiPrompt] = useState('');

  const handleSubmit = (prompt?: string) => {
    const finalPrompt = prompt || aiPrompt;
    if (finalPrompt.trim()) {
      // Handle AI prompt submission here
      console.log('AI Prompt:', finalPrompt);
      if (!prompt) {
        setAiPrompt('');
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5 text-purple-500" />
          <span>AI Assistant</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3 mb-4">
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
        
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Ask AI anything about your farm..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            className="flex-1"
          />
          <Button 
            size="icon"
            onClick={() => handleSubmit()}
            disabled={!aiPrompt.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
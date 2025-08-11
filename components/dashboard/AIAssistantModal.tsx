'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AIAssistant } from './AIAssistant';

// The modal now accepts props to control its state
interface AIAssistantModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AIAssistantModal = ({ isOpen, onClose }: AIAssistantModalProps) => {
    const samplePrompts = [
        "What are the best crops to plant in my region this season?",
        "How can I identify and treat common pests on my tomato plants?",
        "Generate a crop rotation plan for a 5-acre farm.",
    ];

    // The modal only renders if the isOpen prop is true
    if (!isOpen) {
        return null;
    }

    return (
        <div className= "fixed inset-0 z-50 flex items-center justify-center p-4" >
        {/* Backdrop */ }
        < div
    className = "fixed inset-0 bg-black/50 backdrop-blur-sm"
    onClick = { onClose } // Use the onClose prop to close the modal
        > </div>

    {/* Modal Panel */ }
    <div className="relative z-10 w-full max-w-2xl h-[80vh] bg-white dark:bg-gray-900 rounded-lg shadow-2xl flex flex-col" >
        {/* Close Button */ }
        < div className = "absolute top-2 right-2" >
            <Button
            variant="ghost"
    size = "icon"
    onClick = { onClose } // Use the onClose prop here as well
    className = "rounded-full"
        >
        <X className="h-5 w-5" />
            </Button>
            </div>

    {/* The full AIAssistant component is rendered inside */ }
    <AIAssistant aiPrompts={ samplePrompts } />
        </div>
        </div>
  );
};

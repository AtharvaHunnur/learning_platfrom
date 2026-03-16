'use client';

import React from 'react';
import { AIChat } from './AIChat';
import { adminAssist } from '@/lib/ai';
import { ShieldCheck } from 'lucide-react';

export const AdminAssistant = () => {
  const suggestions = [
    "Create a course called 'Next.js Mastery' with price 99",
    "Find user 'john@example.com' and change role to admin",
    "Summarize platform statistics",
    "List all courses and their prices"
  ];

  const handleSendMessage = async (prompt: string) => {
    const result = await adminAssist(prompt);
    
    // If an action was executed, refresh the data in real-time
    if (result.actionExecuted) {
      console.log(`Action executed: ${result.actionExecuted}`);
      // Using reload to ensure all admin tables stay synced
      setTimeout(() => {
        window.location.reload();
      }, 2000); // Small delay to let the user see the confirmation message
    }
    
    return result.response;
  };

  return (
    <AIChat
      title="Admin Operations Helper"
      onSendMessage={handleSendMessage}
      suggestions={suggestions}
      placeholder="Automate or solve platform issues..."
      systemIcon={<ShieldCheck className="w-4 h-4" />}
    />
  );
};

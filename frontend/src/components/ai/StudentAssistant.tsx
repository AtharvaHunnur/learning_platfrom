'use client';

import React from 'react';
import { AIChat } from './AIChat';
import { studentChat } from '@/lib/ai';
import { GraduationCap } from 'lucide-react';

export const StudentAssistant = () => {
  const suggestions = [
    "What courses do you recommend?",
    "How do I track my progress?",
    "Help me with my study schedule",
    "Tell me about Blockchain course"
  ];

  return (
    <AIChat
      title="Student Learning Buddy"
      onSendMessage={studentChat}
      suggestions={suggestions}
      placeholder="Ask about your courses..."
      systemIcon={<GraduationCap className="w-4 h-4" />}
    />
  );
};

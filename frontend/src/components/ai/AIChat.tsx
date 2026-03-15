'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, Sparkles, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatProps {
  title?: string;
  onSendMessage: (message: string) => Promise<string>;
  suggestions?: string[];
  placeholder?: string;
  systemIcon?: React.ReactNode;
}

export const AIChat = ({ 
  title = "AI Assistant", 
  onSendMessage, 
  suggestions = [], 
  placeholder = "Type your message...",
  systemIcon = <Bot className="w-5 h-5 text-primary" />
}: AIChatProps) => {
  const [isOpen, setIsOpen] = useState(false);
  //   const { user } = useAuthStore();
  //   const [messages, setMessages] = useState<Message[]>([]);
  //   const [input, setInput] = useState("");
  //   const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setMessages([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await onSendMessage(text);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having a bit of trouble connecting to my brain right now. Please try again in a moment!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 pointer-events-none">
      <div className="pointer-events-auto flex flex-col items-end gap-4">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
              animate={{ y: 0, opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ y: 20, opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-[380px] md:w-[420px]"
            >
              <Card className="shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-border/40 bg-card/90 backdrop-blur-2xl overflow-hidden flex flex-col h-[600px] rounded-[24px]">
                <CardHeader className="p-5 border-b border-border/40 bg-gradient-to-r from-primary/10 to-transparent flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.3)]">
                      {systemIcon}
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold tracking-tight text-foreground">
                        {title}
                      </CardTitle>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">AI Powered</span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsOpen(false)} 
                    className="h-9 w-9 rounded-full hover:bg-accent/10 text-muted-foreground hover:text-foreground transition-all"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent" ref={scrollRef}>
                  {messages.length === 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-12"
                    >
                      <div className="w-16 h-16 rounded-3xl bg-primary/5 flex items-center justify-center mx-auto mb-6 border border-primary/10">
                        <Sparkles className="w-8 h-8 text-primary shadow-2xl" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">How can I assist you?</h3>
                      <p className="text-xs text-muted-foreground px-12 leading-relaxed">
                        I&apos;m here to answer your questions, give suggestions, and help automate your tasks.
                      </p>
                      
                      <div className="mt-8 grid grid-cols-1 gap-2.5 px-6">
                        {suggestions.slice(0, 3).map((s, i) => (
                          <motion.button
                            key={i}
                            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)' }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSend(s)}
                            className="flex items-center gap-3 text-left px-4 py-3 rounded-xl border border-border/40 bg-accent/5 text-xs text-muted-foreground hover:text-foreground transition-all group"
                          >
                            <Wand2 className="w-3.5 h-3.5 text-primary/60 group-hover:text-primary transition-colors" />
                            {s}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                  
                  {messages.map((m, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={cn(
                        "flex flex-col gap-1.5",
                        m.role === 'user' ? "items-end" : "items-start"
                      )}
                    >
                      <div className={cn(
                        "max-w-[88%] px-4 py-3 text-sm leading-relaxed",
                        m.role === 'user' 
                          ? "bg-primary text-primary-foreground rounded-[20px] rounded-tr-none shadow-lg shadow-primary/10" 
                          : "bg-accent/10 text-foreground rounded-[20px] rounded-tl-none border border-border/40 shadow-xl"
                      )}>
                        <div className="whitespace-pre-wrap">
                          {m.content}
                        </div>
                      </div>
                      <span className="text-[10px] text-muted-foreground/60 px-1 font-medium">
                        {m.role === 'user' ? 'You' : title}
                      </span>
                    </motion.div>
                  ))}
                  
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-3"
                    >
                      <div className="bg-accent/10 border border-border/40 px-4 py-4 rounded-[20px] rounded-tl-none">
                        <div className="flex gap-1.5">
                          {[0, 0.2, 0.4].map((delay) => (
                            <motion.span
                              key={delay}
                              animate={{ y: [0, -4, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay }}
                              className="w-1.5 h-1.5 bg-primary/60 rounded-full"
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </CardContent>

                <CardFooter className="p-5 border-t border-border/40 bg-card/50">
                  <div className="relative w-full group">
                    <Input
                      placeholder={placeholder}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                      className="w-full h-12 bg-accent/5 border-border/40 rounded-2xl pr-12 text-sm focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all placeholder:text-muted-foreground/50"
                    />
                    <Button 
                      size="icon" 
                      onClick={() => handleSend(input)} 
                      disabled={isLoading || !input.trim()} 
                      className="absolute right-1.5 top-1.5 h-9 w-9 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:grayscale"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          animate={isOpen ? { scale: 0.8, opacity: 0, y: 20 } : { scale: 1, opacity: 1, y: 0 }}
          className="pointer-events-auto"
        >
          <Button
            onClick={() => setIsOpen(true)}
            className="w-16 h-16 rounded-[24px] shadow-[0_15px_35px_rgba(var(--primary),0.3)] bg-primary hover:bg-primary/90 transition-all duration-500 overflow-hidden relative group"
          >
            <motion.div 
              className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
              initial={false}
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
            <MessageSquare className="w-7 h-7 relative z-10 group-hover:scale-110 transition-transform duration-300" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

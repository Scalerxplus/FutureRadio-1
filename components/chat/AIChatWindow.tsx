"use client";

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Music } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'rj';
  text: string;
}

interface AIChatWindowProps {
  currentSong: string;
  cityId?: string;
  userName?: string;
}

export default function AIChatWindow({ currentSong, cityId = 'raipur', userName = 'Listener' }: AIChatWindowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'rj', text: `Yo ${userName}! Main Prameesh hoon. Koi gaana sunna hai toh batao!` }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userText = inputValue;
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsTyping(true);

    try {
      // Format messages for Groq API (excluding initial greeting to save tokens if needed, but keeping it for context is fine)
      const apiMessages = messages.map(m => ({
        role: m.role === 'rj' ? 'assistant' : 'user',
        content: m.text
      })).concat({ role: 'user', content: userText });

      const response = await fetch('/api/chat/rj', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          currentSong,
          cityId,
          userName
        })
      });

      if (!response.ok) throw new Error("API Error");

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'rj', text: data.response }]);
      
    } catch (error) {
      setMessages(prev => [...prev, { role: 'rj', text: "Sorry bhai, network glitch hai. Thodi der baad try karna!" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-brand-primary text-white shadow-[0_0_20px_rgba(255,0,85,0.5)] hover:scale-105 transition-all duration-300"
        >
          <MessageCircle size={28} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 md:w-96 h-[500px] max-h-[80vh] flex flex-col bg-[#0a0a0f]/90 backdrop-blur-xl border border-[#2a2a35] rounded-2xl shadow-2xl overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-[#111118]/80 border-b border-[#2a2a35]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-primary/20 flex items-center justify-center border border-brand-primary/50 relative">
                <span className="text-xl">🎧</span>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#111118]"></div>
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">RJ Prameesh <span className="text-[10px] bg-brand-primary/20 text-brand-primary px-1.5 py-0.5 rounded ml-1">AI</span></h3>
                <p className="text-xs text-brand-secondary flex items-center gap-1">
                  <Music size={10} /> Live Now
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                  msg.role === 'user' 
                    ? 'bg-brand-primary text-white rounded-br-none' 
                    : 'bg-[#1a1a24] text-gray-200 border border-[#2a2a35] rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-[#1a1a24] border border-[#2a2a35] rounded-2xl rounded-bl-none px-4 py-3 flex gap-1">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-[#111118]/80 border-t border-[#2a2a35]">
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Request a song..."
                className="flex-1 bg-[#1a1a24] text-white text-sm rounded-full px-4 py-2.5 border border-[#2a2a35] focus:outline-none focus:border-brand-primary"
              />
              <button 
                onClick={handleSend}
                disabled={!inputValue.trim() || isTyping}
                className="w-10 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-primary/80 transition-colors"
              >
                <Send size={16} className="ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

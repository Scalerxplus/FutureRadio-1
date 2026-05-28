"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'rj';
  text: string;
}

interface EmbeddedChatProps {
  currentSong: string;
  cityId?: string;
  userName?: string;
}

export default function EmbeddedChat({ currentSong, cityId = 'raipur', userName = 'Listener' }: EmbeddedChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'rj', text: `Yo! Main Prameesh hoon. Koi special gaana sunna hai?` }
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
    <div className="h-[160px] border border-[#2a2a35] bg-[#111118]/70 backdrop-blur-xl rounded-2xl p-3 flex flex-col relative overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      
      {/* Header Badge */}
      <div className="flex items-center gap-2 mb-2 px-1">
        <div className="w-2 h-2 rounded-full bg-brand-red animate-pulse"></div>
        <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest">
          Live Chat · AI RJ Prameesh
        </span>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2 pb-2 scrollbar-hide">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-xl px-3 py-1.5 text-[11px] leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-brand-red/20 text-white border border-brand-red/30 rounded-br-sm' 
                : 'bg-transparent text-gray-300 border-l-2 border-brand-red pl-2'
            }`}>
              {msg.role === 'rj' && <span className="font-bold text-brand-red mr-1">RJ:</span>}
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-transparent border-l-2 border-brand-red pl-2 px-3 py-1.5 flex gap-1">
              <span className="font-bold text-brand-red text-[11px] mr-1">RJ:</span>
              <div className="flex gap-1 items-center">
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Minimal Input Area */}
      <div className="relative mt-1">
        <input 
          type="text" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Request a song..."
          className="w-full bg-[#1a1a24] text-white text-[11px] rounded-lg pl-3 pr-10 py-2 border border-[#2a2a35] focus:outline-none focus:border-brand-red transition-colors"
        />
        <button 
          onClick={handleSend}
          disabled={!inputValue.trim() || isTyping}
          className="absolute right-1 top-1 w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-brand-red disabled:opacity-50 transition-colors"
        >
          <Send size={12} />
        </button>
      </div>
    </div>
  );
}

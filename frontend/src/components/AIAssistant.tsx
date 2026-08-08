'use client';

import React, { useState, useContext, useRef, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { API_BASE_URL } from '../config/api';

export default function AIAssistant() {
  const context = useContext(AppContext);
  if (!context) return null;
  const { user } = context;

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string; actionPlan?: string[] }>>([
    { sender: 'bot', text: "Hello! I am your Janova AI Citizen Assistant. I can explain legal codes, suggest welfare schemes, translate document guidelines, or outline custom action checklists for you." }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [legalInput, setLegalInput] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSendQuery = async (queryText?: string) => {
    const query = queryText || inputText;
    if (!query.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { sender: 'user', text: query }]);
    setInputText('');
    setIsTyping(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          user_context: { name: user?.name, citizen_id: user?.citizenId }
        })
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { sender: 'bot', text: data.reply, actionPlan: data.action_plan }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { sender: 'bot', text: "Sorry, I am having trouble connecting to the AI core right now. Please check if the FastAPI backend is running." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleTranslateText = async () => {
    if (!legalInput.trim()) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ legal_text: legalInput })
      });
      if (res.ok) {
        const data = await res.json();
        setTranslatedText(data.plain_language_translation);
      }
    } catch (e) {
      setTranslatedText("Translation engine offline.");
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white p-3.5 rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all transform hover:scale-105 cursor-pointer flex items-center gap-2.5 border border-white/20"
        >
          <span className="text-xl">🤖</span>
          <span className="text-xs font-bold font-heading pr-1">AI Assistant</span>
        </button>
      )}

      {/* Slide-over Chat Drawer */}
      <div className={`fixed top-0 right-0 bottom-0 z-50 w-80 md:w-96 bg-white dark:bg-[#0F1626] border-l border-[#E2E8F0] dark:border-[#1E293B] shadow-2xl transition-transform duration-300 transform flex flex-col justify-between ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Title Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-4 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
            <div className="flex flex-col">
              <span className="font-heading text-sm font-bold">Janova AI Assistant</span>
              <span className="text-[9px] text-white/80">GovTech Concierge & Legal Guide</span>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white p-1 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Main Container tabs */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          
          {/* Chat History Panel */}
          <div className="flex-1 flex flex-col gap-3 max-h-[380px] overflow-y-auto border-b border-[#E2E8F0] dark:border-[#1E293B] pb-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col max-w-[88%] ${msg.sender === 'user' ? 'self-end items-end' : 'self-start'}`}>
                <div className={`rounded-xl p-3 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-[#F1F5F9] dark:bg-[#172033] text-[#0F172A] dark:text-[#E2E8F0] rounded-tl-none border border-[#E2E8F0]/40 dark:border-[#1E293B]/40'
                }`}>
                  {msg.text}
                </div>
                
                {/* AI action plan helper */}
                {msg.actionPlan && msg.actionPlan.length > 0 && (
                  <div className="mt-2 bg-[#FBBF24]/10 border border-[#FBBF24]/30 rounded-xl p-3 flex flex-col gap-1 w-full text-[10px] font-semibold text-[#D97706]">
                    <span className="uppercase text-[8px] font-extrabold tracking-wider mb-1">📋 Action Checklist:</span>
                    {msg.actionPlan.map((step, idx) => <span key={idx}>{step}</span>)}
                  </div>
                )}
              </div>
            ))}
            {isTyping && <span className="text-[10px] text-[#94A3B8] italic animate-pulse">Janova AI is processing...</span>}
            <div ref={chatEndRef} />
          </div>

          {/* Legal Language Translator block */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase text-[#94A3B8] tracking-wider">Legal Code & Policy Translator</span>
            <textarea
              className="form-control !text-[11px] h-16 resize-none p-2"
              placeholder="Paste complex policy text or terms here..."
              value={legalInput}
              onChange={(e) => setLegalInput(e.target.value)}
            />
            <button 
              type="button" 
              onClick={handleTranslateText}
              className="btn btn-secondary !py-1.5 text-[10px] w-full font-bold cursor-pointer"
            >
              Translate to Simple Terms
            </button>
            {translatedText && (
              <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-[10px] font-medium leading-relaxed">
                {translatedText}
              </div>
            )}
          </div>

        </div>

        {/* Input query form */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSendQuery(); }}
          className="p-3 border-t border-[#E2E8F0] dark:border-[#1E293B] flex gap-2 bg-white dark:bg-[#0F1626] shrink-0"
        >
          <input
            type="text"
            placeholder="Ask Janova AI Assistant..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 rounded-xl bg-[#F1F5F9] dark:bg-[#172033] px-3.5 py-2 text-xs text-[#0F172A] dark:text-[#F8FAFC] border border-transparent focus:border-blue-500 focus:outline-none"
          />
          <button type="submit" className="btn btn-primary h-9 w-9 !p-0 rounded-xl shrink-0 flex items-center justify-center cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.925A1.5 1.5 0 0 0 5.135 9.25h5.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.087l-1.414 4.926a.75.75 0 0 0 .826.95 28.896 28.896 0 0 0 15.293-7.154.75.75 0 0 0 0-1.115A28.897 28.897 0 0 0 3.105 2.288Z" />
            </svg>
          </button>
        </form>
      </div>
    </>
  );
}

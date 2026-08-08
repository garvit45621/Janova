'use client';

import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

export default function VoiceVaniView() {
  const [selectedLang, setSelectedLang] = useState<'Hindi' | 'Kannada' | 'Tamil' | 'Telugu' | 'Marathi' | 'Bengali' | 'English'>('Hindi');
  const [voiceQuery, setVoiceQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [vaniResult, setVaniResult] = useState<{
    native_response: string;
    english_translation: string;
    action_steps: string[];
    lang_code: string;
  } | null>(null);

  const languages = [
    { name: 'Hindi', label: 'हिंदी', flag: '🇮🇳', sample: 'पासपोर्ट रिन्यू कराने का तरीका क्या है?' },
    { name: 'Kannada', label: 'ಕನ್ನಡ', flag: '🏛️', sample: 'ನನ್ನ ಪಡಿತರ ಚೀಟಿ ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸುವುದು ಹೇಗೆ?' },
    { name: 'Tamil', label: 'தமிழ்', flag: '🌊', sample: 'வருமான சான்றிதழ் பெறுவது எப்படி?' },
    { name: 'Telugu', label: 'తెలుగు', flag: '🌾', sample: 'రైతు భరోసా పథకం అర్హత నిబంధనలు ఏమిటి?' },
    { name: 'Marathi', label: 'मराठी', flag: '🚩', sample: 'ज्येष्ठ नागरिक सवलत पास कसा मिळवावा?' },
    { name: 'Bengali', label: 'বাংলা', flag: '🎨', sample: 'ডিজিটাল বার্থ সার্টিফিকেট কীভাবে ডাউনলোড করব?' },
    { name: 'English', label: 'English', flag: '🌐', sample: 'How to apply for MCA SPICe+ company registration?' }
  ];

  const handleVoiceProcess = async (queryText?: string) => {
    const query = queryText || voiceQuery;
    if (!query.trim()) return;

    setIsProcessing(true);
    setVaniResult(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/voice-vani`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          language: selectedLang
        })
      });

      if (res.ok) {
        const data = await res.json();
        setVaniResult(data);
        // Automatically speak back in native language if Web Speech API is supported
        speakNativeResponse(data.native_response, data.lang_code);
      }
    } catch (e) {
      setVaniResult({
        native_response: "Janova Vani voice server offline. Please check backend FastAPI connection.",
        english_translation: "Voice server offline",
        action_steps: ["Ensure backend running on port 8000"],
        lang_code: "en-IN"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const speakNativeResponse = (text: string, langCode: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop current speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode || 'hi-IN';
      utterance.rate = 0.95;
      
      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleMicListening = () => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      const langMap: Record<string, string> = {
        'Hindi': 'hi-IN',
        'Kannada': 'kn-IN',
        'Tamil': 'ta-IN',
        'Telugu': 'te-IN',
        'Marathi': 'mr-IN',
        'Bengali': 'bn-IN',
        'English': 'en-IN'
      };

      recognition.lang = langMap[selectedLang] || 'hi-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setVoiceQuery(transcript);
        setIsListening(false);
        handleVoiceProcess(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } else {
      // Fallback simulation for browsers without WebSpeech microphone API permission
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        const sampleQuery = languages.find(l => l.name === selectedLang)?.sample || 'How to register for citizen benefits?';
        setVoiceQuery(sampleQuery);
        handleVoiceProcess(sampleQuery);
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto p-4 md:p-8 animate-scale-in text-left">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 md:p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-52 h-52 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col gap-2 z-10">
          <div className="flex items-center gap-2">
            <span className="badge !bg-amber-400 !text-slate-900 font-extrabold py-0.5 px-2.5 text-[10px] shadow-sm">
              🎙️ JANOVA VANI • जनोवा वाणी
            </span>
            <span className="text-[10px] text-emerald-100 font-mono">Multilingual Voice AI</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">Vernacular Voice AI Assistant</h1>
          <p className="text-xs md:text-sm text-emerald-100 max-w-2xl leading-relaxed">
            Speak to Janova in your native mother tongue. Voice guidance available in Hindi, Kannada, Tamil, Telugu, Marathi, Bengali, and English with instant speech synthesis playback.
          </p>
        </div>

        <div className="flex items-center gap-2 z-10 shrink-0 bg-white/15 p-3 rounded-2xl border border-white/20 backdrop-blur-md">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          <span className="font-extrabold text-xs text-white">Voice Engine Active</span>
        </div>
      </div>

      {/* Language Selector Cards */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Select Your Preferred Language (भाषा चुनें):
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {languages.map((l) => {
            const isSelected = selectedLang === l.name;
            return (
              <button
                key={l.name}
                onClick={() => setSelectedLang(l.name as any)}
                className={`p-3.5 rounded-2xl border transition-all duration-200 flex flex-col items-center gap-1 cursor-pointer text-center ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/30 scale-105 font-bold'
                    : 'bg-white dark:bg-[#0F1626] border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span className="text-lg">{l.flag}</span>
                <span className="text-xs font-extrabold">{l.label}</span>
                <span className="text-[9px] opacity-75">{l.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Voice Interactive Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Microphone & Voice Input */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="glass-card p-8 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center gap-6 shadow-xl bg-white/90 dark:bg-[#0F1626]/90 relative overflow-hidden">
            
            <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Tap Microphone & Speak Your Query
            </span>

            {/* Giant Animated Pulse Mic Button */}
            <div className="relative flex items-center justify-center my-4">
              {isListening && (
                <>
                  <div className="absolute w-36 h-36 bg-emerald-500/20 rounded-full animate-ping" />
                  <div className="absolute w-28 h-28 bg-emerald-500/40 rounded-full animate-pulse" />
                </>
              )}
              <button
                onClick={toggleMicListening}
                disabled={isProcessing}
                className={`w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all duration-300 transform hover:scale-105 cursor-pointer shadow-2xl relative z-10 ${
                  isListening
                    ? 'bg-rose-500 text-white shadow-rose-500/50 animate-bounce'
                    : 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-emerald-500/40 hover:shadow-emerald-500/60'
                }`}
              >
                <span className="text-3xl">{isListening ? '🎙️' : '🎤'}</span>
                <span className="text-[9px] font-extrabold uppercase mt-1">
                  {isListening ? 'Listening...' : 'Tap to Speak'}
                </span>
              </button>
            </div>

            {/* Text Query Input Option */}
            <div className="w-full flex flex-col gap-2 text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Or Type Your Query ({selectedLang}):</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={voiceQuery}
                  onChange={(e) => setVoiceQuery(e.target.value)}
                  placeholder={`e.g., ${languages.find(l => l.name === selectedLang)?.sample}`}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => handleVoiceProcess()}
                  disabled={isProcessing || !voiceQuery.trim()}
                  className="btn bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 rounded-xl shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? '...' : 'Ask'}
                </button>
              </div>
            </div>

            {/* Quick Sample Query Presets */}
            <div className="w-full flex flex-col gap-2 text-left border-t border-slate-200 dark:border-slate-800 pt-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Sample 1-Click Voice Prompts:</span>
              <button
                onClick={() => {
                  const sample = languages.find(l => l.name === selectedLang)?.sample || '';
                  setVoiceQuery(sample);
                  handleVoiceProcess(sample);
                }}
                className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs font-medium text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 transition-all text-left flex items-center gap-2"
              >
                <span>💬</span>
                <span className="truncate">{languages.find(l => l.name === selectedLang)?.sample}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: AI Vernacular Speech Response */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {!vaniResult && !isProcessing && (
            <div className="glass-card p-10 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 flex flex-col items-center justify-center text-center gap-4 text-slate-400 my-auto min-h-[400px]">
              <span className="text-5xl">🎙️</span>
              <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">Janova Vani Voice Assistant Ready</h3>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Click the microphone or select a sample prompt to hear Janova Vani guide you in your native language.
              </p>
            </div>
          )}

          {isProcessing && (
            <div className="glass-card p-10 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center gap-4 my-auto min-h-[400px]">
              <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
              <span className="font-bold text-xs text-slate-700 dark:text-slate-300">
                Processing Vernacular AI Speech ({selectedLang})...
              </span>
            </div>
          )}

          {vaniResult && (
            <div className="flex flex-col gap-6 animate-scale-in">
              {/* Output Card 1: Native Vernacular Speech Card */}
              <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-emerald-950 text-white border border-emerald-500/30 shadow-2xl flex flex-col gap-5 relative overflow-hidden">
                
                <div className="flex justify-between items-center z-10">
                  <span className="badge !bg-emerald-400 !text-slate-900 font-extrabold text-[10px]">
                    🎙️ JANOVA VANI VOICE RESPONSE ({selectedLang})
                  </span>

                  <button
                    onClick={() => speakNativeResponse(vaniResult.native_response, vaniResult.lang_code)}
                    className={`btn text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-2 cursor-pointer transition-all shadow-md ${
                      isPlayingAudio ? 'bg-amber-400 text-slate-900 animate-pulse' : 'bg-white/20 hover:bg-white/30 text-white'
                    }`}
                  >
                    <span>{isPlayingAudio ? '🔊 Speaking...' : '🔊 Replay Audio'}</span>
                  </button>
                </div>

                <p className="text-lg md:text-2xl font-extrabold text-emerald-300 leading-relaxed z-10">
                  "{vaniResult.native_response}"
                </p>

                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex flex-col gap-1 z-10">
                  <span className="text-[10px] text-emerald-200 uppercase font-bold tracking-wider">English Translation:</span>
                  <p className="text-xs text-slate-200 font-medium leading-relaxed">
                    {vaniResult.english_translation}
                  </p>
                </div>
              </div>

              {/* Output Card 2: Action Checklist */}
              {vaniResult.action_steps && vaniResult.action_steps.length > 0 && (
                <div className="p-6 rounded-3xl bg-white dark:bg-[#0F1626] border border-slate-200 dark:border-slate-800 flex flex-col gap-3 shadow-lg">
                  <span className="font-extrabold text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                    🎯 Step-by-Step Action Items:
                  </span>
                  <ul className="flex flex-col gap-2 text-xs text-slate-700 dark:text-slate-300">
                    {vaniResult.action_steps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50">
                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-slate-100 leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

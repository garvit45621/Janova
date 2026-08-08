'use client';

import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

const generateSmartVoiceResponse = (query: string, lang: string) => {
  const lower = query.toLowerCase();
  
  let topic = 'general';
  if (lower.includes('passport') || lower.includes('पासपोर्ट') || lower.includes('ಪಾಸ್‌ಪೋರ್ಟ್') || lower.includes('பாஸ்போர்ட்') || lower.includes('पापार्च्या')) topic = 'passport';
  else if (lower.includes('ration') || lower.includes('राशन') || lower.includes('ಪಡಿತರ') || lower.includes('ரேஷன்') || lower.includes('रेशन')) topic = 'ration';
  else if (lower.includes('kisan') || lower.includes('किसान') || lower.includes('ಕಿಸಾನ್') || lower.includes('கிசான்') || lower.includes('రైతు')) topic = 'kisan';
  else if (lower.includes('license') || lower.includes('ड्राइविंग') || lower.includes('ಲೈಸೆನ್ಸ್') || lower.includes('உரிமம்') || lower.includes('లైసెన్స్')) topic = 'dl';
  else if (lower.includes('aadhaar') || lower.includes('adhar') || lower.includes('आधार') || lower.includes('ಆಧಾರ್') || lower.includes('ஆதார்')) topic = 'aadhaar';
  else if (lower.includes('birth') || lower.includes('जन्म') || lower.includes('ಜನನ') || lower.includes('பிறப்பு') || lower.includes('పుట్టిన')) topic = 'birth';
  else if (lower.includes('business') || lower.includes('company') || lower.includes('व्यापार') || lower.includes('उद्यम') || lower.includes('தொழில்')) topic = 'business';
  else if (lower.includes('ayushman') || lower.includes('health') || lower.includes('आयुष्मान') || lower.includes('ஆயுஷ்மான்')) topic = 'ayushman';

  const langCodeMap: Record<string, string> = {
    'Hindi': 'hi-IN',
    'Kannada': 'kn-IN',
    'Tamil': 'ta-IN',
    'Telugu': 'te-IN',
    'Marathi': 'mr-IN',
    'Bengali': 'bn-IN',
    'English': 'en-IN'
  };

  const langCode = langCodeMap[lang] || 'hi-IN';

  if (lang === 'Hindi') {
    if (topic === 'passport') {
      return {
        native_response: `पासपोर्ट आवेदन के लिए: 1. Passport Seva (passportindia.gov.in) पोर्टल पर लॉगिन करें। 2. फॉर्म भरकर PSK स्लॉट बुक करें और आधार, पैन कार्ड लेकर जाएं। 3. पुलिस वेरिफिकेशन के बाद 7 दिनों में पासपोर्ट स्पीड पोस्ट से प्राप्त होगा।`,
        english_translation: `For Passport: Login to Passport Seva portal. Fill form, book PSK appointment, carry Aadhaar & PAN. Delivered via Speed Post post-verification.`,
        action_steps: [
          "passportindia.gov.in पर स्लॉट बुक करें",
          "मूल आधार और पैन कार्ड सत्यापन के लिए साथ रखें",
          "पुलिस वेरिफिकेशन के 7 दिनों में स्पीड पोस्ट से प्राप्त करें"
        ],
        lang_code: langCode
      };
    } else if (topic === 'ration') {
      return {
        native_response: `राशन कार्ड के लिए: राज्य खाद्य एवं नागरिक आपूर्ति (NFSA) पोर्टल पर आवेदन करें। परिवार के सभी सदस्यों के आधार कार्ड और आय प्रमाण पत्र जमा करें।`,
        english_translation: `For Ration Card: Apply on State NFSA portal. Submit Aadhaar cards of all family members and income certificate.`,
        action_steps: [
          "राज्य NFSA पोर्टल पर परिवार विवरण दर्ज करें",
          "आय एवं निवास प्रमाण पत्र अपलोड करें",
          "सत्यापन के बाद राशन दुकान से राशन कार्ड प्राप्त करें"
        ],
        lang_code: langCode
      };
    } else if (topic === 'kisan') {
      return {
        native_response: `पीएम किसान सम्मान निधि (₹6,000/वर्ष): pmkisan.gov.in पर जाएं। अपने आधार नंबर से E-KYC पूरा करें और बैंक खाते को डायरेक्ट बेनिफिट ट्रांसफर (DBT) से लिंक करें।`,
        english_translation: `PM-Kisan Scheme (₹6,000/yr): Visit pmkisan.gov.in. Complete E-KYC with Aadhaar and link bank for direct DBT transfer.`,
        action_steps: [
          "pmkisan.gov.in पर आधार E-KYC पूरा करें",
          "जमीन के दस्तावेज (खसरा/खतौनी) अपलोड करें",
          "बैंक खाते में डीबीटी (DBT) चालू करवाएं"
        ],
        lang_code: langCode
      };
    } else if (topic === 'dl') {
      return {
        native_response: `ड्राइविंग लाइसेंस के लिए: Parivahan Sarathi (parivahan.gov.in) पर लर्नर्स लाइसेंस का फॉर्म भरें। ऑनलाइन सुरक्षा टेस्ट पास करने के 30 दिनों बाद आरटीओ में ड्राइविंग टेस्ट दें।`,
        english_translation: `For Driving License: Apply for Learners License on Parivahan Sarathi. Clear online test and book RTO driving test after 30 days.`,
        action_steps: [
          "parivahan.gov.in पर लर्नर्स लाइसेंस (LL) आवेदन करें",
          "ऑनलाइन रोड सेफ्टी टेस्ट पास करें",
          "30 दिन बाद RTO में प्रैक्टिकल ड्राइविंग टेस्ट दें"
        ],
        lang_code: langCode
      };
    } else if (topic === 'business') {
      return {
        native_response: `व्यापार / कंपनी रजिस्ट्रेशन: 1. MSME Udyam पोर्टल पर 5 मिनट में मुफ्त उद्योग आधार बनाएं। 2. MCA SPICe+ पर कंपनी नाम रिजर्व करें। 3. चालू खाता खोलकर GSTIN प्राप्त करें।`,
        english_translation: `Business Setup: 1. Create free MSME Udyam Certificate in 5 mins. 2. Reserve name on MCA SPICe+. 3. Obtain GSTIN & open commercial bank account.`,
        action_steps: [
          "MSME Udyam पोर्टल पर निःशुल्क पंजीकरण करें",
          "MCA SPICe+ पोर्टल पर कंपनी नाम दर्ज करें",
          "जनोवा बिजनेस हब से डिजिटल चार्टर डाउनलोड करें"
        ],
        lang_code: langCode
      };
    } else {
      return {
        native_response: `आपके प्रश्न '${query}' के लिए: Janova GovTech पोर्टल पर आप आधार वेरीफाई करके ऑनलाइन फॉर्म द्वारा 3 सरल चरणों में सेवा प्राप्त कर सकते हैं।`,
        english_translation: `Regarding '${query}': Complete this service in 3 simple steps via Aadhaar verification on Janova portal.`,
        action_steps: [
          "जनोवा डिजिटल वॉल्ट से आधार एवं पहचान पत्र वेरीफाई करें",
          "आधिकारिक ऑनलाइन आवेदन पत्र भरें",
          "ट्रैकिंग नंबर से स्थिति जांचें"
        ],
        lang_code: langCode
      };
    }
  }

  if (lang === 'Kannada') {
    return {
      native_response: `ನಿಮ್ಮ ಪ್ರಶ್ನೆ '${query}' ಗಾಗಿ: ಜಾನೋವಾ ಗೌಟೆಕ್ ಪೋರ್ಟಲ್ ಮೂಲಕ ನಿಮ್ಮ ಆಧಾರ್ ಮತ್ತು ಡಿಜಿಲಾಕರ್ ಪರಿಶೀಲಿಸಿ 3 ಸರಳ ಹಂತಗಳಲ್ಲಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಬಹುದು.`,
      english_translation: `For '${query}': Submit application in 3 simple steps via DigiLocker on Janova portal.`,
      action_steps: [
        "ಡಿಜಿಲಾಕರ್ ಮೂಲಕ ಆಧಾರ್ ಪರಿಶೀಲಿಸಿ",
        "ಅರ್ಜಿ ನಮೂನೆಯನ್ನು ಭರ್ತಿ ಮಾಡಿ",
        "ಟ್ರ್ಯಾಕಿಂಗ್ ಐಡಿ ಪಡೆಯಿರಿ"
      ],
      lang_code: langCode
    };
  }

  if (lang === 'Tamil') {
    return {
      native_response: `உங்கள் கேள்வி '${query}': ஜனோவா போர்டல் மூலம் ஆதார் மற்றும் டிஜிலாக்கர் சான்றிதழ் பயன்படுத்தி 3 எளிய படிகளில் விண்ணப்பிக்கலாம்.`,
      english_translation: `For '${query}': Apply in 3 simple steps using Aadhaar DigiLocker payload.`,
      action_steps: [
        "ஆதார் சான்றிதழை சரிபார்க்கவும்",
        "விண்ணப்ப படிவத்தை சமர்ப்பிக்கவும்",
        "நிலை கண்காணிப்பு எண்ணைப் பெறவும்"
      ],
      lang_code: langCode
    };
  }

  if (lang === 'Telugu') {
    return {
      native_response: `మీ ప్రశ్న '${query}' కోసం: జనోవా పోర్టల్ ద్వారా ఆధార్ మరియు డిజిలాకర్ వివరాలతో 3 సులభమైన దశల్లో దరఖాస్తు చేసుకోవచ్చు.`,
      english_translation: `For '${query}': Apply in 3 easy steps via DigiLocker.`,
      action_steps: [
        "ఆధార్ వివరాలను సరిచూసుకోండి",
        "ఆన్‌లైన్ ఫారమ్‌ను సమర్పించండి",
        "ట్రాకింగ్ ఐడీని పొందండి"
      ],
      lang_code: langCode
    };
  }

  if (lang === 'Marathi') {
    return {
      native_response: `आपल्या प्रस्तावासाठी '${query}': जनोव्हा पोर्टलद्वारे आपण आधार व डिजिटल व्हॉल्टच्या साहाय्याने ३ सोप्या टप्प्यात अर्ज करू शकता.`,
      english_translation: `For '${query}': Submit your request in 3 easy steps using Digital Vault.`,
      action_steps: [
        "आधार पडताळणी पूर्ण करा",
        "शासकीय अर्ज सादर करा",
        "ट्रॅकिंग आयडी प्राप्त करा"
      ],
      lang_code: langCode
    };
  }

  if (lang === 'Bengali') {
    return {
      native_response: `আপনার প্রশ্ন '${query}'-এর জন্য: জনোভা গভর্নেন্স পোর্টালে আধার ও ডিজিলকারের সাহায্যে ৩টি সহজ ধাপে আবেদন করতে পারেন।`,
      english_translation: `For '${query}': Submit application in 3 simple steps via DigiLocker.`,
      action_steps: [
        "ডিজিটাল নথিপত্র যাচাই করুন",
        "অনলাইন ফর্ম জমা দিন",
        "ট্র্যাকিং স্ট্যাটাস দেখুন"
      ],
      lang_code: langCode
    };
  }

  if (topic === 'passport') {
    return {
      native_response: "For Passport Application: 1. Register on Passport Seva portal (passportindia.gov.in). 2. Fill form and book appointment at PSK. 3. Carry Aadhaar, PAN, and 10th mark sheet to PSK. 4. Passport delivered within 7 days post police verification.",
      english_translation: "For Passport Application: Register on Passport Seva portal, book appointment, carry Aadhaar & PAN to PSK.",
      action_steps: [
        "Book slot at passportindia.gov.in",
        "Carry original Aadhaar and PAN card to PSK",
        "Track dispatch status with Speed Post tracking number"
      ],
      lang_code: "en-IN"
    };
  } else if (topic === 'business') {
    return {
      native_response: "For Business Registration: 1. Register free MSME Udyam Certificate in 5 mins. 2. Reserve trade name on MCA SPICe+ portal. 3. Obtain GSTIN and open commercial bank account.",
      english_translation: "Business Registration: 1. Register free MSME Udyam. 2. Reserve name on MCA SPICe+. 3. Obtain GSTIN.",
      action_steps: [
        "Register on MSME Udyam portal",
        "File SPICe+ incorporation on MCA portal",
        "Download Digital State Treasury Charter from Janova Business Hub"
      ],
      lang_code: "en-IN"
    };
  }

  return {
    native_response: `Regarding your query '${query}': You can process this request directly through the Janova GovTech Portal in 3 simple steps via Aadhaar verification and DigiLocker integration.`,
    english_translation: `Regarding your query '${query}': Application processed via Janova Digital Vault payload.`,
    action_steps: [
      "Verify identity using Janova Digital Vault",
      "Review pre-filled municipal application form",
      "Track status with 24h SLA response guarantee"
    ],
    lang_code: "en-IN"
  };
};

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
        speakNativeResponse(data.native_response, data.lang_code);
      } else {
        const smartResult = generateSmartVoiceResponse(query, selectedLang);
        setVaniResult(smartResult);
        speakNativeResponse(smartResult.native_response, smartResult.lang_code);
      }
    } catch (e) {
      const smartResult = generateSmartVoiceResponse(query, selectedLang);
      setVaniResult(smartResult);
      speakNativeResponse(smartResult.native_response, smartResult.lang_code);
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

  const [micStatus, setMicStatus] = useState<string>('');

  const toggleMicListening = () => {
    if (isListening) {
      setIsListening(false);
      setMicStatus('');
      if (typeof window !== 'undefined' && (window as any)._recognitionInstance) {
        try { (window as any)._recognitionInstance.stop(); } catch (e) {}
      }
      return;
    }

    setMicStatus(`🎙️ Initializing mic in ${selectedLang}...`);

    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      try {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        const recognition = new SpeechRecognition();
        (window as any)._recognitionInstance = recognition;

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

        recognition.onstart = () => {
          setIsListening(true);
          setMicStatus(`🎙️ Listening in ${selectedLang}... Speak your question now!`);
        };

        recognition.onresult = (event: any) => {
          if (event.results && event.results[0] && event.results[0][0]) {
            const transcript = event.results[0][0].transcript;
            setVoiceQuery(transcript);
            setIsListening(false);
            setMicStatus(`Captured: "${transcript}"`);
            handleVoiceProcess(transcript);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn("Speech recognition notice:", event.error);
          setIsListening(false);
          setMicStatus(`Microphone access quiet/blocked. Running Voice AI assistant...`);
          
          const sampleQuery = voiceQuery.trim() || languages.find(l => l.name === selectedLang)?.sample || 'Passport application procedure';
          setVoiceQuery(sampleQuery);
          handleVoiceProcess(sampleQuery);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
      } catch (err) {
        console.warn("Speech recognition start fallback:", err);
        runFallbackVoiceSimulation();
      }
    } else {
      runFallbackVoiceSimulation();
    }
  };

  const runFallbackVoiceSimulation = () => {
    setIsListening(true);
    setMicStatus(`🎙️ Listening in ${selectedLang}... (Simulated Voice)`);
    setTimeout(() => {
      setIsListening(false);
      const sampleQuery = voiceQuery.trim() || languages.find(l => l.name === selectedLang)?.sample || 'How to renew passport online?';
      setVoiceQuery(sampleQuery);
      setMicStatus(`Captured: "${sampleQuery}"`);
      handleVoiceProcess(sampleQuery);
    }, 1500);
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
            <div className="relative flex flex-col items-center justify-center my-4">
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

              {micStatus && (
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-3 animate-fade-in">
                  {micStatus}
                </span>
              )}
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

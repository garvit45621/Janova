'use client';

import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';

export default function LandingView() {
  const context = useContext(AppContext);
  if (!context) return null;
  const { login, loginWithGoogle, sendLoginOtp, verifyLoginOtp, register } = context;

  const [authMode, setAuthMode] = useState<'landing' | 'login' | 'register'>('landing');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Google OAuth Modal States
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('garvit.sarna2001@gmail.com');
  const [isLoggingInGoogle, setIsLoggingInGoogle] = useState(false);

  // OTP Verification States
  const [loginStep, setLoginStep] = useState<'credentials' | 'otp'>('credentials');
  const [otpCode, setOtpCode] = useState('');
  const [devOtpCode, setDevOtpCode] = useState('');
  const [otpSuccessMessage, setOtpSuccessMessage] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Registration States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [selectedState, setSelectedState] = useState('Karnataka');
  const [regAadhaar, setRegAadhaar] = useState('');
  const [regPassword, setRegPassword] = useState('');
  
  const [error, setError] = useState('');

  // Subtle Micro-Interactions & Interactive Demo States
  const [heroTab, setHeroTab] = useState<'overview' | 'tracking' | 'schemes' | 'locker'>('overview');
  const [trackingStep, setTrackingStep] = useState<number>(1);
  const [demoCategory, setDemoCategory] = useState<'all' | 'farmer' | 'student' | 'business' | 'senior'>('all');
  const [selectedVaultDoc, setSelectedVaultDoc] = useState<'aadhaar' | 'license' | 'degree'>('aadhaar');
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  // Quick Eligibility Checker state
  const [eligibilityState, setEligibilityState] = useState('Karnataka');
  const [eligibilityCat, setEligibilityCat] = useState<'student' | 'farmer' | 'business' | 'senior' | 'salaried'>('student');
  const [eligibilityIncome, setEligibilityIncome] = useState<'<2.5L' | '2.5L-5L' | '5L-10L' | '>10L'>('<2.5L');

  // Core Pillars Showcase tab & interactive pin state
  const [activePillar, setActivePillar] = useState<'vault' | 'complaints' | 'schemes' | 'business'>('vault');
  const [activeMapPin, setActiveMapPin] = useState<number>(0);
  const [showEncryptedPayload, setShowEncryptedPayload] = useState<boolean>(false);

  // FAQ accordion state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Search input preview
  const [quickSearch, setQuickSearch] = useState('');

  // Live Radar Real-Time Events State
  const [radarEvents, setRadarEvents] = useState<Array<{ icon: string; city: string; text: string; time: string }>>([
    { icon: '⚡', city: 'Bengaluru', text: 'Passport Renewal Verified (Stage 3/4)', time: '2 mins ago' },
    { icon: '🛡️', city: 'Delhi', text: 'Aadhaar Record Synced via DigiLocker', time: 'Just now' },
    { icon: '📍', city: 'Mumbai', text: 'Ward 14 Streetlight SLA Resolved', time: '12 mins ago' },
    { icon: '💰', city: 'Karnataka', text: 'PM-Kisan Grant Disbursed (₹6,000)', time: '5 mins ago' },
    { icon: '🏢', city: 'Hyderabad', text: 'Pvt Ltd Company Incorporated via SPICe+ MCA', time: '18 mins ago' }
  ]);

  useEffect(() => {
    const fetchRadar = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/services/live-radar');
        if (res.ok) {
          const data = await res.json();
          if (data.events && data.events.length > 0) {
            setRadarEvents(data.events);
          }
        }
      } catch (e) {
        console.log('Live radar sync active');
      }
    };
    fetchRadar();
    const interval = setInterval(fetchRadar, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleHeroMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 12) value = value.slice(0, 12);
    let formatted = '';
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) formatted += '-';
      formatted += value[i];
    }
    setRegAadhaar(formatted);
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in email and password.');
      return;
    }
    setError('');
    setIsSendingOtp(true);

    const res = await sendLoginOtp(email, password);
    setIsSendingOtp(false);

    if (res.success) {
      // User is logged in directly and welcome email is dispatched to their inbox
      setLoginStep('email');
    } else {
      setError(res.message || 'Invalid credentials or request failed.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    setError('');
    setIsVerifyingOtp(true);

    const res = await verifyLoginOtp(email, otpCode);
    setIsVerifyingOtp(false);

    if (!res.success) {
      setError(res.message || 'Invalid verification code.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) {
      setError('Name, email, and password are required.');
      return;
    }
    const fullAddress = `${regAddress}, ${selectedState}${regAadhaar ? ' (Aadhaar: ' + regAadhaar + ')' : ''}`;
    const success = await register(regName, regEmail, regPhone, fullAddress, regPassword);
    if (!success) setError('Registration failed.');
  };

  // Listen for Google OAuth redirect callback token in URL hash
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
      const params = new URLSearchParams(window.location.hash.substring(1));
      const token = params.get('access_token');
      if (token) {
        fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
          if (data.email) {
            loginWithGoogle(data.email, data.name, data.picture);
            window.history.replaceState(null, '', window.location.pathname);
          }
        })
        .catch(err => console.error("Google userinfo error", err));
      }
    }
  }, []);

  const handleGoogleButtonClick = () => {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (googleClientId && googleClientId.includes('.apps.googleusercontent.com')) {
      const redirectUri = encodeURIComponent(window.location.origin);
      const scope = encodeURIComponent('email profile');
      window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}`;
    } else {
      setShowGoogleModal(true);
    }
  };

  const handleGoogleSignIn = async (selectedEmail?: string) => {
    const emailToUse = selectedEmail || customGoogleEmail || 'garvit.sarna2001@gmail.com';
    setIsLoggingInGoogle(true);
    setError('');

    const namePart = emailToUse.split('@')[0].replace('.', ' ').replace(/\b\w/g, c => c.toUpperCase());
    const photoUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop";

    const success = await loginWithGoogle(emailToUse, namePart, photoUrl);
    setIsLoggingInGoogle(false);
    setShowGoogleModal(false);

    if (!success) {
      setError('Google Sign-In failed. Please try again.');
    }
  };

  const fillDemoCreds = () => {
    setEmail('aria.sterling@janova.gov');
    setPassword('demopass123');
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] dark:bg-[#080D1A] text-[#0F172A] dark:text-[#F8FAFC] flex flex-col justify-between relative overflow-hidden transition-colors">
      
      {/* Background decorations */}
      <div className="absolute top-[10%] left-[-10%] w-[350px] h-[350px] bg-amber-500/10 dark:bg-blue-600/15 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[300px] h-[300px] bg-blue-600/10 dark:bg-cyan-600/15 rounded-full blur-[70px] pointer-events-none" />

      {/* Navbar Header */}
      <header className="h-20 border-b border-[#E5DFD5] dark:border-[#1E293B] bg-[#FAF6F0]/85 dark:bg-[#0F1626]/70 backdrop-blur-md px-6 md:px-12 flex items-center justify-between z-10 shrink-0">
        <div onClick={() => setAuthMode('landing')} className="flex items-center gap-3 cursor-pointer group" title="Return to Homepage">
          <div className="h-10 w-10 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center text-white font-extrabold shadow group-hover:scale-105 transition-transform">J</div>
          <span className="font-heading text-lg font-bold tracking-tight text-gradient">Janova.</span>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => setAuthMode('login')} 
            className="text-xs font-bold text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] cursor-pointer"
          >
            Log In
          </button>
          <button 
            onClick={() => setAuthMode('register')} 
            className="btn btn-primary text-xs py-2 px-5 cursor-pointer"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Content panel switch */}
      <main className="flex-1 flex items-center justify-center max-w-7xl mx-auto w-full px-6 py-12 z-10">
        {authMode === 'landing' && (
          <div className="flex flex-col gap-14 w-full animate-scale-in">
            {/* LIVE CIVIC ACTIVITY RADAR TICKER */}
            <div className="w-full bg-slate-900/90 text-white rounded-2xl p-2.5 border border-slate-800 backdrop-blur-md overflow-hidden flex items-center gap-4 text-xs shadow-xl relative">
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30 font-bold text-[10px] uppercase tracking-wider shrink-0 z-10">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                LIVE CIVIC RADAR
              </div>

              <div className="overflow-hidden relative w-full flex items-center">
                <div className="animate-ticker flex items-center gap-8 whitespace-nowrap text-[11px] font-mono text-slate-300">
                  {radarEvents.concat(radarEvents).map((item, idx) => (
                    <React.Fragment key={idx}>
                      <span className="flex items-center gap-1.5">
                        <span className="text-cyan-400 font-bold">{item.icon} {item.city}:</span> 
                        <span>{item.text}</span>
                        <span className="text-slate-500 font-sans text-[10px]">🕒 {item.time}</span>
                      </span>
                      <span className="text-slate-700">•</span>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* HERO GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
              <div className="lg:col-span-7 flex flex-col items-start gap-6 text-left">
                <div className="flex items-center gap-2">
                  <span className="badge badge-primary py-1.5 px-3 text-[10px] font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                    JAN-OS v4.8 • NATIONAL GOVTECH SYSTEM
                  </span>
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.08] tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
                  The Operating System for <br />
                  <span className="text-gradient-space">National Civic Life.</span>
                </h1>
                
                <p className="text-sm text-[#475569] dark:text-[#94A3B8] max-w-xl leading-relaxed">
                  Unified client-side encrypted credentials vault, automated welfare scheme engine, geospatial municipal ticket tracking, and 48-hour business incorporation for 1.4 Billion citizens.
                </p>

                {/* FUTURISTIC COMMAND PALETTE SIMULATION BAR */}
                <div className="w-full max-w-lg flex flex-col gap-2.5 bg-white/70 dark:bg-[#0F172A]/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-xl shadow-xl">
                  <div className="flex items-center gap-2.5 px-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                      ⌘K
                    </div>
                    <input
                      type="text"
                      value={quickSearch}
                      onChange={(e) => setQuickSearch(e.target.value)}
                      placeholder="Type a service: 'Passport', 'PM Kisan', 'Streetlight', 'Locker'..."
                      className="bg-transparent border-0 outline-none text-xs text-[#0F172A] dark:text-white w-full placeholder-slate-400 font-medium"
                    />
                    {quickSearch && (
                      <button onClick={() => setQuickSearch('')} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer px-1">✕</button>
                    )}
                  </div>

                  {/* Quick Shortcut Tags */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider px-1">Quick Actions:</span>
                    {['Passport Renewal', 'PM-Kisan Scheme', 'Streetlight Issue', 'DigiLocker Vault', 'MSME Allotment'].map(tag => (
                      <button
                        key={tag}
                        onClick={() => setQuickSearch(tag)}
                        className={`text-[10px] px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                          quickSearch === tag 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : 'bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>

                  {quickSearch && (
                    <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs flex justify-between items-center text-left animate-scale-in">
                      <div>
                        <span className="font-bold text-blue-600 dark:text-blue-400 block">Instant OS Handshake: {quickSearch}</span>
                        <span className="text-[10px] text-slate-400">AES-256 Verified • Direct Government Portal Route</span>
                      </div>
                      <button onClick={() => setAuthMode('login')} className="btn btn-primary !py-1 !px-3 text-[10px] font-bold">Execute Now →</button>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-4 mt-1">
                  <button onClick={() => setAuthMode('register')} className="btn btn-primary py-3.5 px-8 text-xs font-bold shadow-xl shadow-blue-500/25 cursor-pointer hover:scale-[1.02] transition-transform">
                    Register Citizen ID 🚀
                  </button>
                  <button onClick={() => setAuthMode('login')} className="btn btn-secondary py-3.5 px-8 text-xs font-bold cursor-pointer">
                    Access OS Portal
                  </button>
                </div>
              </div>

              {/* HERO RIGHT: 3D Interactive Citizen Digital Pass & AI Assistant Deck */}
              <div className="lg:col-span-5 flex justify-center">
                <div 
                  onMouseMove={handleHeroMouseMove}
                  style={{
                    '--mouse-x': `${mousePos.x}%`,
                    '--mouse-y': `${mousePos.y}%`
                  } as React.CSSProperties}
                  className="spotlight-card bg-white/95 dark:bg-[#0F1626]/95 rounded-3xl w-full max-w-[460px] p-6 flex flex-col gap-4 font-sans text-xs relative overflow-hidden border border-amber-200/80 dark:border-slate-800 shadow-2xl group hover:border-blue-500/50 transition-all duration-300 text-left"
                >
                  {/* Top Bar Header */}
                  <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300 tracking-wider uppercase font-mono">JANOVA_CITIZEN_OS_DECK</span>
                    </div>
                    <span className="badge badge-primary !py-1 !px-2.5 text-[9px] font-bold shadow-sm">Interactive AI Hub</span>
                  </div>

                  {/* Interactive Tab Navigator */}
                  <div className="flex bg-slate-100 dark:bg-slate-900/90 p-1 rounded-xl gap-1 text-[10px] font-extrabold">
                    {(['overview', 'tracking', 'schemes', 'locker'] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setHeroTab(tab)}
                        className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer capitalize ${
                          heroTab === tab
                            ? 'bg-blue-600 text-white shadow-md font-extrabold scale-[1.02]'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                        }`}
                      >
                        {tab === 'overview' ? 'ID Card' : tab === 'tracking' ? 'Live Track' : tab === 'schemes' ? 'AI Grants' : 'Vault'}
                      </button>
                    ))}
                  </div>

                  {/* TAB 1: INTERACTIVE 3D FLIP CITIZEN IDENTITY CARD */}
                  {heroTab === 'overview' && (
                    <div className="flex flex-col gap-3 animate-scale-in">
                      <div className="p-4 bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-600 text-white rounded-2xl shadow-xl flex flex-col justify-between min-h-[160px] relative overflow-hidden group/card">
                        <div className="absolute -right-10 -bottom-10 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />
                        
                        <div className="flex justify-between items-start z-10">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-extrabold text-white text-base shadow">J</div>
                            <div>
                              <span className="font-bold text-xs block leading-tight">Janova Digital Citizen ID</span>
                              <span className="text-[9px] text-blue-100 font-mono">VID: 9182-4912-8819</span>
                            </div>
                          </div>
                          <span className="badge !bg-emerald-400 !text-slate-900 font-extrabold text-[9px] shadow-sm">VERIFIED</span>
                        </div>

                        <div className="flex justify-between items-end z-10 pt-4">
                          <div className="flex flex-col">
                            <span className="text-[9px] text-blue-200 uppercase font-bold tracking-wider">Citizen Name</span>
                            <span className="font-extrabold text-sm text-white">Garvit Sarna</span>
                          </div>
                          <button
                            onClick={() => setShowEncryptedPayload(!showEncryptedPayload)}
                            className="bg-white/20 hover:bg-white/30 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-md transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                          >
                            <span>{showEncryptedPayload ? '📄 Show ID' : '🔄 Flip QR'}</span>
                          </button>
                        </div>

                        {showEncryptedPayload && (
                          <div className="absolute inset-0 bg-[#0B132B] p-4 flex flex-col justify-between z-20 animate-scale-in">
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="text-cyan-400 font-mono font-bold">SHA-256 QR VERIFIER</span>
                              <button onClick={() => setShowEncryptedPayload(false)} className="text-white hover:text-cyan-300 text-xs">✕</button>
                            </div>
                            <div className="flex items-center justify-center gap-3">
                              <div className="w-14 h-14 bg-white p-1 rounded-lg shrink-0 flex items-center justify-center">
                                <div className="w-full h-full bg-slate-900 rounded flex items-center justify-center text-[8px] text-white font-mono">QR-SEC</div>
                              </div>
                              <div className="flex flex-col text-[9px] text-slate-300 font-mono text-left">
                                <span>Encrypted Biometric Hash</span>
                                <span className="text-cyan-300">8f4a9b2c...e12d4</span>
                                <span>Issuer: UIDAI DigiLocker</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Interactive Quick Status Counters */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-1 text-left shadow-sm">
                          <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Matched Welfare Grants</span>
                          <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">₹48,000 / Year</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-1 text-left shadow-sm">
                          <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Passport Renewal</span>
                          <span className="font-extrabold text-sm text-blue-600 dark:text-blue-400">50% In Progress</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: LIVE TRACKING INTERACTIVE SIMULATOR */}
                  {heroTab === 'tracking' && (
                    <div className="flex flex-col gap-3 text-left animate-scale-in">
                      <div className="flex justify-between items-center text-xs font-bold border-b border-slate-200 dark:border-slate-800 pb-2">
                        <span className="text-slate-900 dark:text-white font-extrabold">Passport Application Tracking</span>
                        <span className="text-blue-600 dark:text-blue-400 font-mono font-bold">Ref #JNV-88219</span>
                      </div>

                      {/* Interactive Step Clicker */}
                      <div className="grid grid-cols-4 gap-1 py-1">
                        {[
                          { step: 0, title: '1. Submitted' },
                          { step: 1, title: '2. Police Verif.' },
                          { step: 2, title: '3. Printing' },
                          { step: 3, title: '4. Dispatched' }
                        ].map((s) => (
                          <button
                            key={s.step}
                            onClick={() => setTrackingStep(s.step)}
                            className={`p-1.5 rounded-lg text-[9px] font-bold text-center border transition-all cursor-pointer ${
                              trackingStep === s.step
                                ? 'bg-blue-600 text-white border-blue-600 shadow-md font-extrabold'
                                : trackingStep > s.step
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {s.title}
                          </button>
                        ))}
                      </div>

                      {/* Detail card based on active step */}
                      <div className="p-3.5 bg-blue-50 dark:bg-blue-950/30 rounded-2xl border border-blue-200 dark:border-blue-800 flex flex-col gap-1.5 text-xs shadow-sm">
                        <div className="flex justify-between items-center font-bold">
                          <span className="text-blue-700 dark:text-blue-400 font-extrabold">
                            {trackingStep === 0 && 'Stage 1: Bio-data Verified & Paid'}
                            {trackingStep === 1 && 'Stage 2: Police Field Inspection'}
                            {trackingStep === 2 && 'Stage 3: Security Booklet Printing'}
                            {trackingStep === 3 && 'Stage 4: Dispatched via Speed Post'}
                          </span>
                          <span className="badge badge-primary !text-[9px]">
                            {trackingStep === 3 ? 'Completed' : 'In Progress'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                          {trackingStep === 0 && 'Bio-data verified against UIDAI Aadhaar records. Fee payment of ₹1,500 confirmed.'}
                          {trackingStep === 1 && 'Indiranagar Police Station assigned Inspector S. Kumar. Appointment verified today.'}
                          {trackingStep === 2 && 'Security booklet printed at India Security Press, Nashik. Passport booklet ready.'}
                          {trackingStep === 3 && 'Speed Post Tracking #EK983204919IN. Estimated delivery to residential address tomorrow by 4 PM.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: AI SCHEME MATCHER SIMULATOR */}
                  {heroTab === 'schemes' && (
                    <div className="flex flex-col gap-3 text-left animate-scale-in">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-900 dark:text-white font-extrabold">AI Grant & Scheme Finder</span>
                        <span className="text-amber-600 dark:text-amber-400 font-extrabold">Live Matcher</span>
                      </div>

                      <div className="flex gap-1.5 flex-wrap">
                        {(['all', 'farmer', 'student', 'business', 'senior'] as const).map(cat => (
                          <button
                            key={cat}
                            onClick={() => setDemoCategory(cat)}
                            className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold capitalize transition-all cursor-pointer ${
                              demoCategory === cat
                                ? 'bg-amber-500 text-white shadow-md'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>

                      <div className="flex flex-col gap-2">
                        {(demoCategory === 'all' || demoCategory === 'farmer') && (
                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-sm">
                            <div>
                              <span className="font-extrabold block text-xs text-slate-900 dark:text-white">PM Kisan Samman Nidhi</span>
                              <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">Direct Agri Support • ₹6,000 / yr</span>
                            </div>
                            <span className="badge !bg-emerald-500/15 !text-emerald-700 dark:!text-emerald-400 font-extrabold">98% Match</span>
                          </div>
                        )}
                        {(demoCategory === 'all' || demoCategory === 'student') && (
                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-sm">
                            <div>
                              <span className="font-extrabold block text-xs text-slate-900 dark:text-white">Post-Matric Higher Ed Scholarship</span>
                              <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">Tuition Waiver • ₹48,000 / yr</span>
                            </div>
                            <span className="badge !bg-emerald-500/15 !text-emerald-700 dark:!text-emerald-400 font-extrabold">94% Match</span>
                          </div>
                        )}
                        {(demoCategory === 'business') && (
                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-sm">
                            <div>
                              <span className="font-extrabold block text-xs text-slate-900 dark:text-white">Startup India Seed Fund Scheme</span>
                              <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">Proof of Concept • Up to ₹20 Lakhs</span>
                            </div>
                            <span className="badge !bg-emerald-500/15 !text-emerald-700 dark:!text-emerald-400 font-extrabold">91% Match</span>
                          </div>
                        )}
                        {(demoCategory === 'senior') && (
                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-sm">
                            <div>
                              <span className="font-extrabold block text-xs text-slate-900 dark:text-white">Pradhan Mantri Vaya Vandana</span>
                              <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">Guaranteed Pension • 7.4% Return</span>
                            </div>
                            <span className="badge !bg-emerald-500/15 !text-emerald-700 dark:!text-emerald-400 font-extrabold">96% Match</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 4: DIGITAL LOCKER INTERACTIVE DEMO */}
                  {heroTab === 'locker' && (
                    <div className="flex flex-col gap-3 text-left animate-scale-in">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-900 dark:text-white font-extrabold">Digital Credentials Vault</span>
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-mono font-bold">
                          🔐 AES-256 Encrypted
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { key: 'aadhaar', label: 'Aadhaar Card' },
                          { key: 'license', label: 'Driving License' },
                          { key: 'degree', label: 'Degree Cert.' }
                        ].map(doc => (
                          <button
                            key={doc.key}
                            onClick={() => setSelectedVaultDoc(doc.key as any)}
                            className={`p-2 rounded-lg text-[10px] font-extrabold border transition-all cursor-pointer ${
                              selectedVaultDoc === doc.key
                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {doc.label}
                          </button>
                        ))}
                      </div>

                      <div className="p-3.5 bg-slate-900 text-white rounded-xl border border-slate-800 flex flex-col gap-2 font-mono text-[11px] shadow-md">
                        <div className="flex justify-between items-center">
                          <span className="text-cyan-400 font-bold">
                            {selectedVaultDoc === 'aadhaar' && '📄 UIDAI Aadhaar Vault Record'}
                            {selectedVaultDoc === 'license' && '🚗 Transport Dept. License'}
                            {selectedVaultDoc === 'degree' && '🎓 University Degree Certificate'}
                          </span>
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30 font-bold">VERIFIED</span>
                        </div>
                        <div className="text-[10px] text-slate-300 flex flex-col gap-0.5">
                          <span>SHA-256: 8f4a9b2c...e12d4</span>
                          <span>Issuer: Government of India DigiLocker Sync</span>
                          <span>Status: Valid & Active</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sandbox helper footer */}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-600 dark:text-slate-400 font-semibold">
                    <span>Click tabs to explore live features</span>
                    <button onClick={() => setAuthMode('login')} className="text-blue-600 dark:text-blue-400 font-extrabold hover:underline cursor-pointer">Try Full App →</button>
                  </div>
                </div>
              </div>
            </div>

            {/* INSTANT 2-CLICK ELIGIBILITY CALCULATOR WIDGET */}
            <div className="w-full glass-card p-6 md:p-8 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-amber-500/10 border-blue-500/20 flex flex-col gap-5 text-left shadow-2xl relative overflow-hidden">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <span className="badge badge-primary py-1 px-3 text-[9px] font-bold mb-1">Instant Calculator</span>
                  <h3 className="text-xl md:text-2xl font-extrabold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
                    Check Eligible Schemes & Services in 2 Clicks
                  </h3>
                  <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-1">
                    Select your residing state, category, and income bracket to preview direct government support.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  {/* State Select */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">State</span>
                    <select
                      value={eligibilityState}
                      onChange={(e) => setEligibilityState(e.target.value)}
                      className="form-control text-xs font-semibold py-2 px-3 min-w-[130px]"
                    >
                      {['Karnataka', 'Maharashtra', 'Delhi', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Gujarat'].map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  {/* Category Select */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Category</span>
                    <select
                      value={eligibilityCat}
                      onChange={(e) => setEligibilityCat(e.target.value as any)}
                      className="form-control text-xs font-semibold py-2 px-3 min-w-[140px]"
                    >
                      <option value="student">Student / Scholar</option>
                      <option value="farmer">Farmer / Agri</option>
                      <option value="business">Entrepreneur / MSME</option>
                      <option value="senior">Senior Citizen</option>
                      <option value="salaried">Working Professional</option>
                    </select>
                  </div>

                  {/* Income Tier Select */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Annual Income</span>
                    <select
                      value={eligibilityIncome}
                      onChange={(e) => setEligibilityIncome(e.target.value as any)}
                      className="form-control text-xs font-semibold py-2 px-3 min-w-[120px]"
                    >
                      <option value="<2.5L">&lt; ₹2.5 Lakhs</option>
                      <option value="2.5L-5L">₹2.5L - ₹5 Lakhs</option>
                      <option value="5L-10L">₹5L - ₹10 Lakhs</option>
                      <option value=">10L">&gt; ₹10 Lakhs</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Calculated Result Box */}
              <div className="p-4 rounded-2xl bg-white/80 dark:bg-[#0F1626]/80 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-extrabold flex items-center justify-center text-lg shadow-md shrink-0">
                    🎯
                  </div>
                  <div>
                    <span className="font-bold text-sm text-[#0F172A] dark:text-white block">
                      {eligibilityCat === 'student' && (eligibilityIncome === '<2.5L' ? '3 Full Scholarships Matched • 100% Tuition Waiver' : '2 Skill Grants Matched • Up to ₹35,000 / Year')}
                      {eligibilityCat === 'farmer' && (eligibilityIncome === '<2.5L' ? '4 Direct Subsidies Matched • Up to ₹78,000 / Year' : '3 Agri Tech Grants Matched • 50% Equipment Support')}
                      {eligibilityCat === 'business' && '3 Grants Matched • Collateral-Free Credit & Tax Exemptions'}
                      {eligibilityCat === 'senior' && '3 Pension Schemes Matched • Up to ₹60,000 / Year'}
                      {eligibilityCat === 'salaried' && (eligibilityIncome === '>10L' ? 'Fast-Track Express Services • Instant E-Passbook Sync' : '2 Tax Relief Schemes Matched • Up to ₹12,000 Credit')}
                    </span>
                    <span className="text-xs text-slate-400">
                      Verified for {eligibilityState} residents ({eligibilityIncome} bracket). Zero paperwork submission required on Janova.
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setAuthMode('register')}
                  className="btn btn-primary text-xs py-2.5 px-6 font-bold shrink-0 shadow-md shadow-blue-500/15 cursor-pointer"
                >
                  Claim & Apply Now →
                </button>
              </div>
            </div>

            {/* CORE PILLARS SHOWCASE */}
            <div className="flex flex-col gap-8 text-left">
              <div className="flex flex-col gap-2">
                <span className="badge badge-primary py-1 px-3 text-[9px] font-bold self-start">Unified GovTech Ecosystem</span>
                <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
                  Four Pillars of Modern Civic Infrastructure
                </h2>
              </div>

              {/* Interactive Pillar Selector Tabs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { key: 'vault', icon: '🛡️', title: 'Digital Credentials Vault', badge: 'AES-256' },
                  { key: 'complaints', icon: '📍', title: 'Geospatial Complaints', badge: 'Live Map' },
                  { key: 'schemes', icon: '💰', title: 'Welfare Schemes', badge: 'Auto Match' },
                  { key: 'business', icon: '🏢', title: 'Business Portal', badge: 'SPICe+' }
                ].map(p => (
                  <button
                    key={p.key}
                    onClick={() => setActivePillar(p.key as any)}
                    className={`p-4 rounded-2xl border text-left flex flex-col gap-2 transition-all cursor-pointer ${
                      activePillar === p.key
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-500/15 scale-[1.02]'
                        : 'bg-white/60 dark:bg-[#0F1626]/60 border-slate-200 dark:border-slate-800 hover:border-blue-500/30'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-2xl">{p.icon}</span>
                      <span className={`badge text-[9px] ${activePillar === p.key ? 'bg-white/20 text-white' : 'badge-primary'}`}>
                        {p.badge}
                      </span>
                    </div>
                    <span className="font-bold text-xs md:text-sm">{p.title}</span>
                  </button>
                ))}
              </div>

              {/* Pillar Active Content Card */}
              <div className="glass-card p-6 md:p-8 border-blue-500/20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 flex flex-col gap-4">
                  {activePillar === 'vault' && (
                    <>
                      <span className="badge badge-primary py-1 px-3 text-[9px] font-bold self-start">Encrypted Record Management</span>
                      <h3 className="text-xl md:text-2xl font-bold">Tamper-Proof Citizen Locker</h3>
                      <p className="text-xs md:text-sm text-[#475569] dark:text-[#94A3B8] leading-relaxed">
                        Store and instantly share verified Aadhaar, Driving Licenses, University Degrees, and Land Registry deeds. Zero physical visits to government departments needed.
                      </p>
                      <div className="flex flex-wrap gap-4 text-xs font-semibold pt-2">
                        <span className="flex items-center gap-1.5 text-emerald-500">✓ Instant QR Verification</span>
                        <span className="flex items-center gap-1.5 text-blue-500">✓ Client-side Encryption</span>
                        <span className="flex items-center gap-1.5 text-purple-500">✓ Legal Equivalent to Original</span>
                      </div>
                    </>
                  )}

                  {activePillar === 'complaints' && (
                    <>
                      <span className="badge badge-primary py-1 px-3 text-[9px] font-bold self-start">Neighborhood Resolution Engine</span>
                      <h3 className="text-xl md:text-2xl font-bold">Geospatial Ticket Tracker</h3>
                      <p className="text-xs md:text-sm text-[#475569] dark:text-[#94A3B8] leading-relaxed">
                        Drop a pin on your municipal map for broken road lights, water leaks, or uncollected waste. Public SLA counters hold ward engineers accountable.
                      </p>

                      {/* Interactive Pin Selectors */}
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Sample Ward Pins:</span>
                        {[
                          { id: 0, label: '📍 Streetlight (Ward 14)' },
                          { id: 1, label: '📍 Pothole (Ward 8)' },
                          { id: 2, label: '📍 Water Leak (Ward 12)' }
                        ].map(pin => (
                          <button
                            key={pin.id}
                            onClick={() => setActiveMapPin(pin.id)}
                            className={`text-[10px] px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                              activeMapPin === pin.id
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            {pin.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {activePillar === 'schemes' && (
                    <>
                      <span className="badge badge-primary py-1 px-3 text-[9px] font-bold self-start">Direct Benefit Transfer</span>
                      <h3 className="text-xl md:text-2xl font-bold">Smart Scheme Matching Engine</h3>
                      <p className="text-xs md:text-sm text-[#475569] dark:text-[#94A3B8] leading-relaxed">
                        Algorithms cross-reference Central and State welfare rules to automatically notify you of grants, subsidies, and scholarships you qualify for.
                      </p>
                      <div className="flex flex-wrap gap-4 text-xs font-semibold pt-2">
                        <span className="flex items-center gap-1.5 text-emerald-500">✓ 150+ Grants Covered</span>
                        <span className="flex items-center gap-1.5 text-blue-500">✓ Direct Bank Deposit</span>
                        <span className="flex items-center gap-1.5 text-purple-500">✓ Automated Form Pre-fill</span>
                      </div>
                    </>
                  )}

                  {activePillar === 'business' && (
                    <>
                      <span className="badge badge-primary py-1 px-3 text-[9px] font-bold self-start">Corporate Allotment</span>
                      <h3 className="text-xl md:text-2xl font-bold">48-Hour Business Setup</h3>
                      <p className="text-xs md:text-sm text-[#475569] dark:text-[#94A3B8] leading-relaxed">
                        Incorporate Pvt Ltd, LLP, or OPC entities with integrated MCA name reservation, PAN, TAN, GSTIN, and Bank Account allotment in a single flow.
                      </p>
                      <div className="flex flex-wrap gap-4 text-xs font-semibold pt-2">
                        <span className="flex items-center gap-1.5 text-emerald-500">✓ SPICe+ MCA Integration</span>
                        <span className="flex items-center gap-1.5 text-blue-500">✓ Instant PAN & TAN</span>
                        <span className="flex items-center gap-1.5 text-purple-500">✓ Digital DSC Signature</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="lg:col-span-5 p-5 bg-[#0F172A] text-white rounded-2xl flex flex-col gap-3 font-mono text-xs shadow-2xl border border-slate-800">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2 text-[10px] text-slate-400">
                    <span>LIVE_SYSTEM_STATUS</span>
                    <span className="text-emerald-400">● ACTIVE</span>
                  </div>
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col gap-2">
                    {activePillar === 'vault' && (
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-cyan-400 font-bold">🔐 Vault Record Handshake OK</span>
                          <button
                            onClick={() => setShowEncryptedPayload(!showEncryptedPayload)}
                            className="text-[9px] text-blue-400 hover:underline cursor-pointer"
                          >
                            {showEncryptedPayload ? 'Show Decrypted' : 'Show Cipher'}
                          </button>
                        </div>
                        <span className="text-[10px] text-slate-300">
                          {showEncryptedPayload
                            ? 'U2FsdGVkX1+9Kx2a19LmPz5eX... (AES-256 Encrypted Stream)'
                            : 'Aadhaar ID: XXXX-XXXX-4812 • Verified UIDAI DigiLocker Sync'}
                        </span>
                      </div>
                    )}

                    {activePillar === 'complaints' && (
                      <div className="flex flex-col gap-1 text-left">
                        <span className="text-cyan-400 font-bold">
                          {activeMapPin === 0 && '📍 Ward 14: Streetlight Outage'}
                          {activeMapPin === 1 && '📍 Ward 8: Roadway Pothole'}
                          {activeMapPin === 2 && '📍 Ward 12: Main Pipeline Leak'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {activeMapPin === 0 && 'Assigned Engineer: K. Raman • SLA: 2.1 hrs remaining'}
                          {activeMapPin === 1 && 'Assigned Officer: M. Gupta • Inspection Scheduled'}
                          {activeMapPin === 2 && 'Status: Resolved by BBMP Water Supply Team'}
                        </span>
                      </div>
                    )}

                    {activePillar === 'schemes' && (
                      <span className="text-cyan-400 font-bold text-left">⚡ Matched 4 Grants (Score 98.4%)</span>
                    )}

                    {activePillar === 'business' && (
                      <span className="text-cyan-400 font-bold text-left">🏢 MCA SPICe+ Allotment Ready</span>
                    )}

                    <span className="text-[10px] text-slate-500">Response Latency: 14ms • AES-256 Standard</span>
                  </div>
                  <button onClick={() => setAuthMode('login')} className="btn btn-primary text-xs py-2 w-full font-bold cursor-pointer">
                    Explore in Portal →
                  </button>
                </div>
              </div>
            </div>

            {/* HOLOGRAPHIC IMPACT METRICS STATS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              {[
                { label: 'Encryption Standard', val: '256-Bit', desc: 'UIDAI Compliant' },
                { label: 'Avg Ticket Resolution', val: '4.2 hrs', desc: 'Municipal SLA' },
                { label: 'Disbursed Benefits', val: '₹140 Cr+', desc: 'Direct to Bank' }
              ].map((m, idx) => (
                <div key={idx} className="glass-futuristic p-6 rounded-2xl flex flex-col gap-1.5 hover:border-blue-500/40 transition-all shadow-lg">
                  <span className="text-2xl md:text-3xl font-extrabold text-gradient-space">{m.val}</span>
                  <span className="font-bold text-xs text-[#0F172A] dark:text-white">{m.label}</span>
                  <span className="text-[10px] text-slate-400">{m.desc}</span>
                </div>
              ))}
            </div>

            {/* INTERACTIVE FAQ ACCORDION */}
            <div className="flex flex-col gap-6 text-left max-w-4xl mx-auto w-full pt-4">
              <div className="flex flex-col gap-1 text-center items-center">
                <span className="badge badge-primary py-1 px-3 text-[9px] font-bold">Common Inquiries</span>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Frequently Asked Questions</h2>
              </div>

              <div className="flex flex-col gap-3">
                {[
                  {
                    q: "How does Janova protect citizen credential data?",
                    a: "All documents uploaded to your Vault are AES-256 encrypted on your device prior to synchronization. Raw personal credentials are never sold or shared with unauthorized third parties."
                  },
                  {
                    q: "Can I report municipal complaints without visiting a ward office?",
                    a: "Yes. Janova's geospatial map lets you take a photo, auto-tag your GPS coordinates, and submit complaints directly to local municipal engineers with automated SLA tracking."
                  },
                  {
                    q: "How does the automated welfare scheme matcher work?",
                    a: "Our engine cross-references your state, demographic category, and eligibility parameters against published government grant guidelines to calculate real-time match percentages."
                  },
                  {
                    q: "Is instant business incorporation supported in all states?",
                    a: "Yes. Janova integrates directly with MCA SPICe+ APIs for company name reservation, PAN, TAN, and DIN allotment across India in under 48 hours."
                  }
                ].map((faq, idx) => (
                  <div
                    key={idx}
                    className="glass-card overflow-hidden border border-slate-200 dark:border-slate-800 transition-all rounded-2xl"
                  >
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                      className="w-full p-4 md:p-5 flex items-center justify-between text-left font-bold text-xs md:text-sm text-[#0F172A] dark:text-white cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <span>{faq.q}</span>
                      <span className={`text-blue-500 font-extrabold transition-transform duration-300 ${expandedFaq === idx ? 'rotate-180' : ''}`}>
                        ▼
                      </span>
                    </button>
                    {expandedFaq === idx && (
                      <div className="p-4 md:p-5 pt-0 text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed border-t border-slate-100 dark:border-slate-800/60 animate-scale-in">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {authMode === 'login' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-0 w-full max-w-5xl bg-white/80 dark:bg-[#0F1626]/85 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-scale-in min-h-[580px]">
            
            {/* Left Column: High-Tech Branding / Security Scanner */}
            <div className="md:col-span-5 bg-gradient-to-br from-[#0B132B] via-[#0F1E36] to-[#050B1A] p-8 md:p-10 flex flex-col justify-between text-white relative overflow-hidden hidden md:flex border-r border-slate-800">
              <div className="absolute -top-12 -left-12 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-cyan-500/20 rounded-full blur-[80px] pointer-events-none" />
              
              <div onClick={() => setAuthMode('landing')} className="flex items-center gap-3 cursor-pointer group z-10" title="Return to Homepage">
                <div className="h-10 w-10 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center text-white font-extrabold shadow group-hover:scale-105 transition-transform">J</div>
                <span className="font-heading text-lg font-bold tracking-tight text-gradient-space">Janova.</span>
              </div>
              
              <div className="flex flex-col gap-5 text-left z-10 my-auto py-6">
                <span className="badge badge-primary py-1 px-3 text-[9px] font-bold self-start">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping mr-1"></span>
                  SECURE OS HANDSHAKE
                </span>
                <h3 className="font-heading text-2xl md:text-3xl font-extrabold leading-tight">
                  Welcome back to <br />
                  <span className="text-gradient-space">Citizen Gateway.</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
                  Access digital certificate vaults, track municipal tickets, discover welfare schemes, and manage business incorporations.
                </p>

                {/* High-Tech Security Terminal Preview */}
                <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 flex flex-col gap-2 font-mono text-[10px] text-slate-400 text-left shadow-lg">
                  <div className="flex justify-between items-center text-emerald-400 font-bold border-b border-slate-800 pb-1.5">
                    <span>SECURITY_ENCLAVE</span>
                    <span className="flex items-center gap-1">● VERIFIED</span>
                  </div>
                  <div className="flex flex-col gap-1 text-[10px]">
                    <span className="text-cyan-300">🔑 AES-256 Client Encryption: Active</span>
                    <span className="text-slate-300">🛡️ UIDAI DigiLocker Sync: Ready</span>
                    <span className="text-slate-400">⚡ Response SLA: 14ms Response Time</span>
                  </div>
                </div>
              </div>
              
              <div className="text-[10px] text-slate-400 z-10 flex items-center justify-between border-t border-slate-800 pt-3">
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Aadhaar Authenticated
                </span>
                <span className="font-mono text-slate-500">v4.8_SEC</span>
              </div>
            </div>

            {/* Right Column: Interactive Login Form */}
            <div className="md:col-span-7 p-6 md:p-10 flex flex-col justify-center gap-5 bg-transparent">
              {loginStep === 'credentials' ? (
                <>
                  <div className="flex flex-col gap-1 text-left">
                    <h2 className="text-2xl font-extrabold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">Citizen Authentication</h2>
                    <p className="text-xs text-[#94A3B8]">Sign in to receive your 2FA security key.</p>
                  </div>

                  {error && <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-500 text-left">{error}</div>}

                  <form onSubmit={handleRequestOtp} className="flex flex-col gap-3.5">
                    <div className="form-group text-left">
                      <label className="form-label font-bold text-xs">Email Address</label>
                      <input 
                        type="email" 
                        className="form-control text-xs font-medium" 
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(''); }}
                        placeholder="aria.sterling@janova.gov"
                      />
                    </div>
                    <div className="form-group text-left">
                      <label className="form-label font-bold text-xs">Password</label>
                      <input 
                        type="password" 
                        className="form-control text-xs font-medium" 
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(''); }}
                        placeholder="••••••••"
                      />
                    </div>

                    <button type="submit" disabled={isSendingOtp} className="btn btn-primary w-full py-3 mt-1 flex items-center justify-center gap-2 cursor-pointer font-bold shadow-lg shadow-blue-500/20">
                      {isSendingOtp ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Dispatching Security Key...</span>
                        </>
                      ) : (
                        <span>Send 2FA Verification Code ✉️</span>
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-1.5 text-left">
                    <span className="badge badge-primary py-1 px-3 text-[9px] font-bold self-start mb-1">Step 2: Security Verification</span>
                    <h2 className="text-2xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">Enter 6-Digit Code</h2>
                    <p className="text-xs text-[#94A3B8]">We sent a verification code to <span className="font-semibold text-blue-500">{email}</span></p>
                  </div>

                  {otpSuccessMessage && (
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-600 dark:text-emerald-400 text-left">
                      ✉️ {otpSuccessMessage}
                    </div>
                  )}

                  {devOtpCode && (
                    <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-600 dark:text-blue-400 text-left font-mono font-bold flex justify-between items-center">
                      <span>Dev Mode Test OTP: {devOtpCode}</span>
                      <span className="text-[10px] text-blue-400 font-normal">Auto-filled</span>
                    </div>
                  )}

                  {error && <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-500 text-left">{error}</div>}

                  <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                    <div className="form-group text-left">
                      <label className="form-label font-bold text-xs">6-Digit Security Code</label>
                      <input 
                        type="text" 
                        maxLength={6}
                        className="form-control text-center tracking-[8px] font-mono text-xl font-bold py-3" 
                        value={otpCode}
                        onChange={(e) => { setOtpCode(e.target.value.replace(/\D/g, '')); setError(''); }}
                        placeholder="••••••"
                        autoFocus
                      />
                    </div>

                    <button type="submit" disabled={isVerifyingOtp} className="btn btn-primary w-full py-3 flex items-center justify-center gap-2 cursor-pointer font-bold shadow-lg shadow-blue-500/20">
                      {isVerifyingOtp ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Verifying Security Key...</span>
                        </>
                      ) : (
                        <span>Verify & Launch Janova OS 🚀</span>
                      )}
                    </button>

                    <div className="flex justify-between items-center text-xs pt-1">
                      <button type="button" onClick={() => { setLoginStep('credentials'); setError(''); }} className="text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white bg-transparent border-0 cursor-pointer">
                        ← Change Email
                      </button>
                      <button type="button" onClick={handleRequestOtp} className="text-blue-500 hover:underline font-bold bg-transparent border-0 cursor-pointer">
                        Resend Code
                      </button>
                    </div>
                  </form>
                </>
              )}

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                <span className="flex-shrink mx-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">or</span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              </div>

              {/* Google OAuth Login Button */}
              <button 
                type="button" 
                onClick={handleGoogleButtonClick} 
                disabled={isLoggingInGoogle}
                className="btn btn-secondary w-full py-2.5 flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-800 text-xs font-semibold cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Google Account & OAuth Workflow Selector Modal */}
              {showGoogleModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-white dark:bg-[#0F1626] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-5 text-left animate-scale-in">
                    <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                        </svg>
                        <span className="font-heading font-bold text-sm">Google Authentication Workflow</span>
                      </div>
                      <button onClick={() => setShowGoogleModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">✕</button>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400">Authenticate your account with Google Identity & dispatch a confirmation email.</p>

                    {/* Pre-configured Google Account Options */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Quick Google Account Login</span>
                      
                      <button 
                        onClick={() => handleGoogleSignIn('anu.sarna2001@gmail.com')}
                        disabled={isLoggingInGoogle}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-500/50 hover:bg-purple-500/5 flex items-center justify-between transition-colors text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 text-white font-bold flex items-center justify-center text-sm shadow">
                            A
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">Anu Sarna</span>
                            <span className="text-[10px] text-slate-500">anu.sarna2001@gmail.com</span>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-purple-500">Authenticate →</span>
                      </button>

                      <button 
                        onClick={() => handleGoogleSignIn('garvit.sarna2001@gmail.com')}
                        disabled={isLoggingInGoogle}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 hover:bg-blue-500/5 flex items-center justify-between transition-colors text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow">
                            G
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">Garvit Sarna</span>
                            <span className="text-[10px] text-slate-500">garvit.sarna2001@gmail.com</span>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-blue-500">Authenticate →</span>
                      </button>
                    </div>

                    {/* Custom Google Email Input */}
                    <div className="flex flex-col gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <label className="text-[10px] font-bold uppercase text-slate-400">Or use custom Google email</label>
                      <div className="flex gap-2">
                        <input 
                          type="email"
                          value={customGoogleEmail}
                          onChange={(e) => setCustomGoogleEmail(e.target.value)}
                          placeholder="yourname@gmail.com"
                          className="form-control text-xs flex-1"
                        />
                        <button 
                          onClick={() => handleGoogleSignIn(customGoogleEmail)}
                          disabled={isLoggingInGoogle}
                          className="btn btn-primary text-xs py-2 px-4 cursor-pointer font-bold shrink-0"
                        >
                          Sign In & Send Email
                        </button>
                      </div>
                    </div>

                    {/* Real Google OAuth Redirect Link Option */}
                    <div className="flex flex-col gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <label className="text-[10px] font-bold uppercase text-slate-400">Redirect to Google Login Page (`accounts.google.com`)</label>
                      <button
                        onClick={() => {
                          const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'demo-client-id.apps.googleusercontent.com';
                          const redirectUri = encodeURIComponent(window.location.origin);
                          const scope = encodeURIComponent('email profile');
                          window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}`;
                        }}
                        className="btn btn-secondary text-xs py-2 w-full flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-700 cursor-pointer"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                        </svg>
                        <span>Open accounts.google.com</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/15 flex items-center justify-between text-xs">
                <div className="text-left">
                  <span className="font-bold text-amber-600 dark:text-amber-400 block">Test Citizen Account</span>
                  <span className="text-[10px] text-[#94A3B8]">Loads fully-seeded Indian profiles</span>
                </div>
                <button onClick={fillDemoCreds} className="btn btn-secondary !py-1 !px-3 text-[10px] font-bold border-amber-500/20">Autofill</button>
              </div>

              <p className="text-center text-xs text-[#94A3B8]">
                Need a registry profile?{' '}
                <button onClick={() => setAuthMode('register')} className="text-blue-500 hover:underline bg-transparent cursor-pointer font-bold border-0">Register</button>
              </p>
            </div>
          </div>
        )}

        {authMode === 'register' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-0 w-full max-w-5xl bg-white/70 dark:bg-[#0F1626]/75 backdrop-blur-md border border-[#E2E8F0] dark:border-[#1E293B] rounded-3xl overflow-hidden shadow-2xl animate-scale-in min-h-[600px]">
            
            {/* Left Column: Branding / Info */}
            <div className="md:col-span-5 bg-gradient-to-br from-[#0F1E36] via-[#0A122C] to-[#050B1A] p-10 flex flex-col justify-between text-white relative overflow-hidden hidden md:flex border-r border-[#E2E8F0]/10 dark:border-[#1E293B]/10">
              <div className="absolute -top-10 -left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />
              
              <div onClick={() => setAuthMode('landing')} className="flex items-center gap-3 cursor-pointer group" title="Return to Homepage">
                <div className="h-10 w-10 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center text-white font-extrabold shadow group-hover:scale-105 transition-transform">J</div>
                <span className="font-heading text-lg font-bold tracking-tight text-gradient">Janova.</span>
              </div>
              
              <div className="flex flex-col gap-4 text-left z-10">
                <span className="badge badge-primary py-1 px-3 text-[9px] font-bold self-start">New Account</span>
                <h3 className="font-heading text-2xl font-bold leading-tight">
                  Join the National <br />
                  <span className="text-gradient">Citizen Registry.</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Establish a verified profile to manage secure records, track utility complaints, search central scholarships, and schedule document renewals.
                </p>
              </div>
              
              <div className="text-[10px] text-slate-400 z-10 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
                Official Digital Locker Compliant
              </div>
            </div>

            {/* Right Column: Registration Form */}
            <div className="md:col-span-7 p-8 md:p-10 flex flex-col justify-center gap-5 bg-transparent overflow-y-auto max-h-[720px]">
              <div className="flex flex-col gap-1.5 text-left">
                <h2 className="text-2xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">Citizen Registration</h2>
                <p className="text-xs text-[#94A3B8]">Setup a digital credentials profile.</p>
              </div>

              {error && <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-500 text-left">{error}</div>}

              <form onSubmit={handleRegister} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group sm:col-span-2">
                  <label className="form-label">Full Legal Name</label>
                  <input type="text" className="form-control" value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Aria Sterling" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-control" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="aria.sterling@gmail.com" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Contact</label>
                  <input type="tel" className="form-control" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} placeholder="+91 9876543210" />
                </div>
                <div className="form-group">
                  <label className="form-label">State Selection</label>
                  <select 
                    className="form-control" 
                    value={selectedState} 
                    onChange={(e) => setSelectedState(e.target.value)}
                  >
                    {["Karnataka", "Maharashtra", "Delhi", "Tamil Nadu", "Telangana", "Uttar Pradesh", "Gujarat", "West Bengal", "Kerala", "Andhra Pradesh", "Rajasthan", "Punjab", "Haryana"].map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Aadhaar (Optional, Masked)</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={regAadhaar} 
                    onChange={handleAadhaarChange} 
                    placeholder="XXXX-XXXX-XXXX" 
                  />
                </div>
                <div className="form-group sm:col-span-2">
                  <label className="form-label">Residential Address</label>
                  <input type="text" className="form-control" value={regAddress} onChange={(e) => setRegAddress(e.target.value)} placeholder="12, Residency Rd, Bengaluru" />
                </div>
                <div className="form-group sm:col-span-2">
                  <label className="form-label">Create Password</label>
                  <input type="password" className="form-control" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="••••••••" required />
                </div>

                <button type="submit" className="btn btn-primary sm:col-span-2 w-full py-2.5 mt-2">
                  Register Profile
                </button>
              </form>

              <p className="text-center text-xs text-[#94A3B8]">
                Already registered?{' '}
                <button onClick={() => setAuthMode('login')} className="text-blue-500 hover:underline bg-transparent cursor-pointer font-bold border-0">Log in</button>
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="h-14 border-t border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#0B0F19] flex items-center justify-center z-10 shrink-0">
        <p className="text-[10px] text-[#94A3B8]">© 2026 Janova Government Technologies Inc. All rights reserved. AES-256 Compliant.</p>
      </footer>
    </div>
  );
}

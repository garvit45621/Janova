'use client';

import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';

export default function LandingView() {
  const context = useContext(AppContext);
  if (!context) return null;
  const { login, register } = context;

  const [authMode, setAuthMode] = useState<'landing' | 'login' | 'register'>('landing');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Registration States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [selectedState, setSelectedState] = useState('Karnataka');
  const [regAadhaar, setRegAadhaar] = useState('');
  const [regPassword, setRegPassword] = useState('');
  
  const [error, setError] = useState('');

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in credentials.');
      return;
    }
    const success = await login(email, password);
    if (!success) setError('Invalid email or password.');
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

  const fillDemoCreds = () => {
    setEmail('aria.sterling@janova.gov');
    setPassword('demopass123');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#080D1A] text-[#0F172A] dark:text-[#F8FAFC] flex flex-col justify-between relative overflow-hidden transition-colors">
      
      {/* Background decorations */}
      <div className="absolute top-[10%] left-[-10%] w-[350px] h-[350px] bg-blue-600/10 dark:bg-blue-600/15 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[300px] h-[300px] bg-cyan-600/10 dark:bg-cyan-600/15 rounded-full blur-[70px] pointer-events-none" />

      {/* Navbar Header */}
      <header className="h-20 border-b border-[#E2E8F0] dark:border-[#1E293B] bg-white/70 dark:bg-[#0F1626]/70 backdrop-blur-md px-6 md:px-12 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center text-white font-extrabold shadow">J</div>
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
            <div className="lg:col-span-7 flex flex-col items-start gap-5 animate-scale-in text-left">
              <span className="badge badge-primary py-1.5 px-3.5 text-[10px] font-bold">Secure Enterprise GovTech Platform</span>
              <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.1] tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
                Your entire civic life, <br />
                <span className="text-gradient">in one place.</span>
              </h1>
              <p className="text-sm text-[#475569] dark:text-[#94A3B8] max-w-lg leading-relaxed">
                Janova is a unified operating system for citizens to manage credentials vaults, discover funding grants, pin neighborhood streetlight or roadway complaints, and set up companies.
              </p>
              <div className="flex gap-4 mt-2">
                <button onClick={() => setAuthMode('register')} className="btn btn-primary py-3 px-8 text-xs font-semibold shadow-lg shadow-blue-500/20">
                  Register Your ID
                </button>
                <button onClick={() => setAuthMode('login')} className="btn btn-secondary py-3 px-8 text-xs font-semibold">
                  Access Portal
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center animate-scale-in">
              <div className="glass rounded-2xl w-full max-w-[420px] shadow-2xl p-6 border border-[#E2E8F0]/40 dark:border-[#1E293B]/50 flex flex-col gap-4 font-sans text-xs relative overflow-hidden group">
                {/* Simulated Glass Highlight */}
                <div className="absolute top-0 left-0 w-full h-[150px] bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                
                <div className="flex items-center justify-between border-b border-[#E2E8F0]/50 dark:border-[#1E293B]/50 pb-3 text-[9px] font-bold text-[#94A3B8] tracking-wider">
                  <span>JANOVA_DEMO_DASHBOARD_LIVE</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>ONLINE</span>
                </div>
                
                {/* Mock Card 1: Active Applications */}
                <div className="p-3 bg-white/50 dark:bg-[#172033]/50 rounded-xl border border-[#E2E8F0]/60 dark:border-[#1E293B]/60 flex flex-col gap-2 shadow-sm">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span>Active Applications</span>
                    <span className="badge badge-primary !py-0.5 !px-2">2 In Progress</span>
                  </div>
                  <div className="flex flex-col gap-1.5 text-[11px]">
                    <div className="flex justify-between items-center">
                      <span className="text-[#475569] dark:text-[#94A3B8] text-left">Passport Renewal</span>
                      <span className="font-bold text-blue-500">50%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-1000 w-1/2" />
                    </div>
                  </div>
                </div>

                {/* Mock Card 2: Matched Welfare Schemes */}
                <div className="p-3 bg-white/50 dark:bg-[#172033]/50 rounded-xl border border-[#E2E8F0]/60 dark:border-[#1E293B]/60 flex flex-col gap-2 shadow-sm">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span>Welfare Scheme Matching</span>
                    <span className="text-amber-500 font-extrabold text-[10px]">95% Match</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative flex items-center justify-center shrink-0 w-10 h-10">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="20" cy="20" r="16" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="3" fill="transparent" />
                        <circle cx="20" cy="20" r="16" stroke="currentColor" className="text-amber-500" strokeWidth="3" fill="transparent" strokeDasharray="100" strokeDashoffset="5" />
                      </svg>
                      <span className="absolute text-[8px] font-bold">95%</span>
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-bold text-xs text-[#0F172A] dark:text-white">PM Kisan Samman Nidhi</span>
                      <span className="text-[10px] text-[#94A3B8]">Rs. 6000 Income Support / Year</span>
                    </div>
                  </div>
                </div>

                {/* Mock Card 3: Upcoming Deadlines */}
                <div className="p-3 bg-white/50 dark:bg-[#172033]/50 rounded-xl border border-[#E2E8F0]/60 dark:border-[#1E293B]/60 flex justify-between items-center shadow-sm">
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] text-[#94A3B8] uppercase font-bold tracking-wider">Next Deadline</span>
                    <span className="font-bold text-xs mt-0.5 text-[#0F172A] dark:text-white">Driver's License Renewal</span>
                  </div>
                  <span className="badge !bg-red-500/10 !text-red-500 border border-red-500/20 !py-1 !px-2.5 font-bold">In 25 Days</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {authMode === 'login' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-0 w-full max-w-5xl bg-white/70 dark:bg-[#0F1626]/75 backdrop-blur-md border border-[#E2E8F0] dark:border-[#1E293B] rounded-3xl overflow-hidden shadow-2xl animate-scale-in min-h-[550px]">
            
            {/* Left Column: Branding / Info */}
            <div className="md:col-span-5 bg-gradient-to-br from-[#0F1E36] via-[#0A122C] to-[#050B1A] p-10 flex flex-col justify-between text-white relative overflow-hidden hidden md:flex border-r border-[#E2E8F0]/10 dark:border-[#1E293B]/10">
              <div className="absolute -top-10 -left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />
              
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center text-white font-extrabold shadow">J</div>
                <span className="font-heading text-lg font-bold tracking-tight text-gradient">Janova.</span>
              </div>
              
              <div className="flex flex-col gap-4 text-left z-10">
                <span className="badge badge-primary py-1 px-3 text-[9px] font-bold self-start">National GovTech Platform</span>
                <h3 className="font-heading text-2xl font-bold leading-tight">
                  Your entire civic life, <br />
                  <span className="text-gradient">in one place.</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
                  Access digital certificate registries, track municipal complaints on interactive maps, discover Indian welfare schemes, and incorporate businesses.
                </p>
              </div>
              
              <div className="text-[10px] text-slate-400 z-10 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                AES-256 Encrypted & Aadhaar-Authenticated
              </div>
            </div>

            {/* Right Column: Login Form */}
            <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-center gap-6 bg-transparent">
              <div className="flex flex-col gap-1.5 text-left">
                <h2 className="text-2xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">Citizen Log In</h2>
                <p className="text-xs text-[#94A3B8]">Enter credentials to load your workspace dashboard.</p>
              </div>

              {error && <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-500 text-left">{error}</div>}

              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    placeholder="aria.sterling@janova.gov"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    placeholder="••••••••"
                  />
                </div>

                <button type="submit" className="btn btn-primary w-full py-2.5 mt-2">
                  Sign In
                </button>
              </form>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                <span className="flex-shrink mx-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">or</span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              </div>

              {/* Google OAuth Login Button */}
              <button 
                type="button" 
                onClick={() => alert("Google OAuth login mock activated!")} 
                className="btn btn-secondary w-full py-2.5 flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-800 text-xs font-semibold"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                Continue with Google
              </button>

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
              
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center text-white font-extrabold shadow">J</div>
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

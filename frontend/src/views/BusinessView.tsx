'use client';

import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';

export default function BusinessView() {
  const context = useContext(AppContext);
  if (!context) return null;
  const { bizTemplates, submitServiceApplication } = context;

  const [activeBiz, setActiveBiz] = useState<string>('Startup');
  
  // Visual workflow stages
  const [bizInputs, setBizInputs] = useState({ name: '', checkTerms: false });
  const [isFormed, setIsFormed] = useState(false);
  const [charterNum, setCharterNum] = useState('');
  const [error, setError] = useState('');

  const currentTemplate = bizTemplates.find(b => b.name === activeBiz);

  const handleSubmitLLC = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bizInputs.name) {
      setError('Please provide corporate trade name.');
      return;
    }
    if (!bizInputs.checkTerms) {
      setError('Please acknowledge registration compliance requirements.');
      return;
    }

    setCharterNum(`LLC-${Math.floor(100000 + Math.random() * 900000)}`);
    setIsFormed(true);

    if (currentTemplate) {
      await submitServiceApplication(`Business Registration: ${bizInputs.name} ${activeBiz}`, "Business Portal");
    }
  };

  const handleReset = () => {
    setBizInputs({ name: '', checkTerms: false });
    setIsFormed(false);
    setCharterNum('');
    setError('');
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-7xl mx-auto w-full animate-scale-in text-left">
      {!isFormed ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Business Model type selector cards (Col: 4) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="glass-card p-5 flex flex-col gap-4">
              <h3 className="font-heading text-sm font-bold border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3">Corporate Models</h3>
              <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1">
                {bizTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => { setActiveBiz(template.name); handleReset(); }}
                    className={`flex flex-col text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                      activeBiz === template.name
                        ? 'border-blue-500 bg-blue-500/5'
                        : 'border-[#E2E8F0] dark:border-[#1E293B] hover:bg-slate-50 dark:hover:bg-[#172033]'
                    }`}
                  >
                    <span className="text-xs font-bold">{template.name} Registry</span>
                    <span className="text-[10px] text-[#94A3B8] mt-1 leading-normal">Filing timeline: {template.timeline}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Business templates details checklist (Col: 8) */}
          {currentTemplate && (
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* Requirements widget */}
              <div className="glass-card p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col text-left">
                  <span className="text-[9px] text-[#94A3B8] uppercase font-bold">Registration Timeline</span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-500 mt-1">{currentTemplate.timeline}</span>
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[9px] text-[#94A3B8] uppercase font-bold">Estimated Setup Cost</span>
                  <span className="text-sm font-bold text-emerald-500 mt-1">{currentTemplate.estimated_cost}</span>
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[9px] text-[#94A3B8] uppercase font-bold">Required Approvals</span>
                  <span className="text-xs font-bold mt-1 text-[#475569] dark:text-[#E2E8F0]">{currentTemplate.approvals.join(', ')}</span>
                </div>
              </div>

              {/* Specific Licenses Lists */}
              <div className="glass-card p-5 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div className="flex flex-col gap-3">
                  <h4 className="font-heading text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Required Licenses</h4>
                  <div className="flex flex-col gap-2">
                    {currentTemplate.licenses.map((lic, idx) => (
                      <span key={idx} className="text-xs font-semibold flex items-center gap-2">📌 {lic}</span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <h4 className="font-heading text-xs font-bold text-[#94A3B8] uppercase tracking-wider font-sans">Compliance Checklist</h4>
                  <div className="flex flex-col gap-2">
                    {currentTemplate.compliance_checklist.map((cmp, idx) => (
                      <span key={idx} className="text-xs font-semibold flex items-center gap-2">⚖️ {cmp}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Registration Form */}
              <div className="glass-card p-5 flex flex-col gap-4 text-left">
                <h3 className="font-heading text-sm font-bold border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3">Submit Setup Charter</h3>
                
                {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-500">{error}</div>}

                <form onSubmit={handleSubmitLLC} className="flex flex-col gap-4 pt-1">
                  <div className="form-group">
                    <label className="form-label">Corporate Trade Name</label>
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder={`e.g. Sterling ${activeBiz}`}
                      value={bizInputs.name}
                      onChange={(e) => { setBizInputs(prev => ({ ...prev, name: e.target.value })); setError(''); }}
                    />
                  </div>

                  <label className="form-checkbox text-xs font-semibold">
                    <input 
                      type="checkbox"
                      checked={bizInputs.checkTerms}
                      onChange={(e) => { setBizInputs(prev => ({ ...prev, checkTerms: e.target.checked })); setError(''); }}
                    />
                    Acknowledge the regulatory {currentTemplate.name} compliance rules
                  </label>

                  <button type="submit" className="btn btn-primary w-full py-3">
                    Register and Issue License
                  </button>
                </form>
              </div>

            </div>
          )}

        </div>
      ) : (
        /* Generated Digital Charter Certificate view */
        <div className="glass-card max-w-xl mx-auto w-full p-8 flex flex-col items-center gap-6 text-center animate-scale-in relative border-2 border-amber-500/20">
          <div className="h-14 w-14 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">👑</div>
          
          <div className="flex flex-col gap-1 border-b border-[#E2E8F0] dark:border-[#1E293B] pb-4 w-full">
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Articles of Organization Registered</span>
            <h2 className="text-2xl font-bold tracking-tight">Digital Charter Approved!</h2>
            <p className="text-xs text-[#94A3B8]">Your corporate listing has been generated successfully.</p>
          </div>

          <div className="w-full bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#1E293B] p-6 rounded-xl text-left font-serif relative">
            <div className="text-center font-bold text-xs uppercase tracking-wider text-[#94A3B8] border-b border-dashed border-[#E2E8F0] dark:border-[#1E293B] pb-3 mb-4">
              State Treasury Charter Certificate
            </div>
            
            <div className="flex flex-col gap-3.5 text-xs">
              <div>
                <span className="font-sans font-bold text-[#94A3B8] uppercase text-[9px] block">Company legal designation</span>
                <span className="font-bold text-sm tracking-wide text-blue-600 dark:text-blue-500">{bizInputs.name} ({activeBiz})</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-sans font-bold text-[#94A3B8] uppercase text-[9px] block">Filing Date</span>
                  <span className="font-bold" suppressHydrationWarning>{new Date().toISOString().split('T')[0]}</span>
                </div>
                <div>
                  <span className="font-sans font-bold text-[#94A3B8] uppercase text-[9px] block">Filing License ID</span>
                  <span className="font-mono font-bold">{charterNum}</span>
                </div>
              </div>
            </div>

            {/* Seal */}
            <div className="absolute bottom-4 right-4 h-12 w-12 rounded-full border-2 border-dashed border-amber-500 flex items-center justify-center text-[7px] font-sans font-bold text-amber-500 uppercase text-center leading-[9px] rotate-12">
              Seal of<br/>Janova
            </div>
          </div>

          <div className="flex gap-4 w-full">
            <button onClick={() => alert('Simulating PDF export.')} className="btn btn-secondary flex-1 py-3 text-xs">
              Export PDF
            </button>
            <button onClick={handleReset} className="btn btn-primary flex-1 py-3 text-xs">
              Form Another Business
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

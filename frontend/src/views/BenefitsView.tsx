'use client';

import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Scheme } from '../types';

export default function BenefitsView() {
  const context = useContext(AppContext);
  if (!context) return null;
  const { submitServiceApplication } = context;

  // Form parameters
  const [age, setAge] = useState<number>(24);
  const [gender, setGender] = useState<string>('Female');
  const [state, setState] = useState<string>('Capital Region');
  const [profession, setProfession] = useState<string>('Student');
  const [income, setIncome] = useState<number>(45000);
  const [studentStatus, setStudentStatus] = useState<boolean>(true);
  
  const [discoveredSchemes, setDiscoveredSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleDiscover = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setHasSearched(true);

    try {
      const res = await fetch('http://localhost:8000/api/services/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age,
          gender,
          state,
          profession,
          income,
          student_status: studentStatus
        })
      });
      if (res.ok) {
        setDiscoveredSchemes(await res.json());
      }
    } catch (err) {
      console.error("Discovery request failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyScheme = async (title: string) => {
    await submitServiceApplication(title, "Benefits Discovery");
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-7xl mx-auto w-full animate-scale-in text-left">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Parameters input form (Col: 4) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="glass-card p-5 flex flex-col gap-4">
            <h3 className="font-heading text-sm font-bold border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3">Eligibility Parameters</h3>
            
            <form onSubmit={handleDiscover} className="flex flex-col gap-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group !mb-0">
                  <label className="form-label">Age</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={age} 
                    onChange={(e) => setAge(Number(e.target.value))} 
                  />
                </div>
                <div className="form-group !mb-0">
                  <label className="form-label">Gender</label>
                  <select 
                    className="form-control text-xs" 
                    value={gender} 
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">State</label>
                <select 
                  className="form-control text-xs" 
                  value={state} 
                  onChange={(e) => setState(e.target.value)}
                >
                  <option value="Capital Region">Capital Region</option>
                  <option value="West Shore">West Shore</option>
                  <option value="North Hills">North Hills</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Profession</label>
                <select 
                  className="form-control text-xs" 
                  value={profession} 
                  onChange={(e) => setProfession(e.target.value)}
                >
                  <option value="Student">Student</option>
                  <option value="Employed">Employed</option>
                  <option value="Unemployed">Unemployed</option>
                  <option value="Retired">Retired</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Annual Income ($)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={income} 
                  onChange={(e) => setIncome(Number(e.target.value))} 
                />
              </div>

              <label className="form-checkbox text-xs font-semibold">
                <input 
                  type="checkbox" 
                  checked={studentStatus} 
                  onChange={(e) => setStudentStatus(e.target.checked)} 
                />
                Enrolled as student
              </label>

              <button type="submit" className="btn btn-primary w-full py-3 cursor-pointer">
                {loading ? 'Analyzing...' : 'Discover Benefits'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Matching results (Col: 8) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="glass-card p-5 flex flex-col gap-4 min-h-[300px]">
            <h3 className="font-heading text-sm font-bold border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3">Recommendation System Results</h3>
            
            <div className="flex flex-col gap-4 pt-2">
              {!hasSearched ? (
                <p className="text-center py-12 text-xs text-[#94A3B8] font-medium">Specify your demographic parameters on the left to launch recommendations.</p>
              ) : loading ? (
                <p className="text-center py-12 text-xs text-[#94A3B8] font-bold animate-pulse">Running compatibility matching index...</p>
              ) : discoveredSchemes.length === 0 ? (
                <p className="text-center py-12 text-xs text-[#94A3B8] font-medium">No matching government benefits found.</p>
              ) : (
                discoveredSchemes.map((sch) => (
                  <div key={sch.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-[#E2E8F0] dark:border-[#1E293B]/70 flex justify-between gap-4 hover:scale-[1.01] transition-transform">
                    <div className="flex flex-col gap-3 flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="badge badge-primary">{sch.category}</span>
                        
                        {/* Match compatibility badge */}
                        <span className={`text-[10px] font-bold ${
                          sch.matchPercentage && sch.matchPercentage >= 80 ? 'text-emerald-500' : 'text-amber-500'
                        }`}>
                          🔥 {sch.matchPercentage}% Compatibility Match
                        </span>
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold">{sch.title}</span>
                        <p className="text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed">{sch.desc}</p>
                      </div>

                      {sch.requirements && sch.requirements.length > 0 && (
                        <div className="text-[10px] text-[#94A3B8] flex gap-1 items-center flex-wrap">
                          <span className="font-bold uppercase shrink-0">Required Vault Files:</span>
                          {sch.requirements.map((reqFile, fIdx) => (
                            <span key={fIdx} className="bg-slate-200 dark:bg-slate-700 text-[#475569] dark:text-[#E2E8F0] px-1.5 py-0.5 rounded font-normal shrink-0">{reqFile}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end justify-between shrink-0 border-l border-[#E2E8F0] dark:border-[#1E293B]/50 pl-4 min-w-[120px]">
                      <div className="flex flex-col text-right">
                        <span className="text-[9px] text-[#94A3B8] uppercase font-bold">Welfare Amount</span>
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-500">{sch.amount}</span>
                      </div>
                      
                      <button 
                        onClick={() => handleApplyScheme(sch.title)}
                        className="btn btn-primary text-[10px] !py-1.5 !px-3.5 shadow"
                      >
                        Apply Now
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

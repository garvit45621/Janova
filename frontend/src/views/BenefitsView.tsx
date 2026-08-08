'use client';

import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Scheme } from '../types';
import { API_BASE_URL } from '../config/api';

const DEFAULT_SCHEMES_LIST: Scheme[] = [
  {
    id: 1,
    title: "PM-Kisan Samman Nidhi Yojana",
    description: "Direct annual income support of ₹6,000 disbursed in three equal installments to farmer families.",
    desc: "Direct annual income support of ₹6,000 disbursed in three equal installments to farmer families.",
    category: "Subsidies",
    amount: "₹6,000 / year",
    eligibility_rules: { max_income: 300000, profession: "Farmer" },
    requirements: ["Land Holding Record (7/12 / Khasra)", "Bank Account linked with Aadhaar", "e-KYC Completion"],
    matchPercentage: 94
  },
  {
    id: 2,
    title: "Post-Matric Higher Education Scholarship",
    description: "Financial assistance for tuition fees, maintenance allowance, and book grants for students.",
    desc: "Financial assistance for tuition fees, maintenance allowance, and book grants for students.",
    category: "Scholarships",
    amount: "₹25,000 / year",
    eligibility_rules: { max_income: 250000, profession: "Student" },
    requirements: ["College Bonafide Certificate", "Income Certificate below ₹2.5L", "Aadhaar Linked Bank Passbook"],
    matchPercentage: 91
  },
  {
    id: 3,
    title: "Pradhan Mantri Matru Vandana Yojana (PMMVY)",
    description: "Maternity benefit incentive of ₹5,000 paid directly to pregnant and lactating mothers.",
    desc: "Maternity benefit incentive of ₹5,000 paid directly to pregnant and lactating mothers.",
    category: "Welfare",
    amount: "₹5,000 one-time",
    eligibility_rules: { max_income: 800000, profession: "General" },
    requirements: ["Mother & Child Protection (MCP) Card", "Pregnancy Registration at Anganwadi", "Aadhaar Card"],
    matchPercentage: 86
  },
  {
    id: 4,
    title: "Stand-Up India Business Loan Scheme",
    description: "Bank loans between ₹10 Lakh and ₹1 Crore for setting up greenfield enterprises.",
    desc: "Bank loans between ₹10 Lakh and ₹1 Crore for setting up greenfield enterprises.",
    category: "Grants",
    amount: "₹10 Lakh - ₹1 Crore",
    eligibility_rules: { max_income: 1500000, profession: "Entrepreneur" },
    requirements: ["Detailed Business Project Report (DPR)", "Udyam Registration", "CIBIL Score > 700"],
    matchPercentage: 82
  },
  {
    id: 5,
    title: "PM Street Vendor's AtmaNirbhar Nidhi (PM SVANidhi)",
    description: "Collateral-free working capital loan of ₹10,000 to ₹50,000 for urban street vendors.",
    desc: "Collateral-free working capital loan of ₹10,000 to ₹50,000 for urban street vendors.",
    category: "Subsidies",
    amount: "Up to ₹50,000",
    eligibility_rules: { max_income: 200000, profession: "Vendor" },
    requirements: ["Vending Certificate / Urban Local Body ID Card", "Aadhaar Card", "UPI QR Code"],
    matchPercentage: 78
  },
  {
    id: 6,
    title: "Ayushman Bharat PM-JAY Health Coverage",
    description: "Cashless secondary and tertiary hospitalization cover up to ₹5 Lakh per family per year.",
    desc: "Cashless secondary and tertiary hospitalization cover up to ₹5 Lakh per family per year.",
    category: "Welfare",
    amount: "₹5,00,000 / year",
    eligibility_rules: { max_income: 500000, profession: "General" },
    requirements: ["Ration Card Copy", "Aadhaar Card", "Family ID"],
    matchPercentage: 75
  }
];

export default function BenefitsView() {
  const context = useContext(AppContext);
  if (!context) return null;
  const { schemes, submitServiceApplication } = context;

  // Form parameters
  const [age, setAge] = useState<number>(24);
  const [gender, setGender] = useState<string>('Female');
  const [state, setState] = useState<string>('Capital Region');
  const [profession, setProfession] = useState<string>('Student');
  const [income, setIncome] = useState<number>(450000);
  const [studentStatus, setStudentStatus] = useState<boolean>(true);
  
  const [discoveredSchemes, setDiscoveredSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(false);
  const [appliedSchemeToast, setAppliedSchemeToast] = useState<string | null>(null);

  const computeMatches = (schemeList: Scheme[], pIncome: number, pProf: string, pStudent: boolean) => {
    const source = (schemeList && schemeList.length > 0) ? schemeList : DEFAULT_SCHEMES_LIST;
    return source.map((sch, idx) => {
      let score = 65 + (idx % 4) * 5;
      const rules = sch.eligibility_rules || {};
      if (rules.max_income && pIncome <= rules.max_income) score += 15;
      if (rules.profession) {
        if (rules.profession === pProf || (rules.profession === 'Student' && pStudent)) score += 10;
      }
      const finalScore = Math.min(Math.max(score, 55), 98);
      return {
        ...sch,
        desc: sch.desc || sch.description,
        matchPercentage: sch.matchPercentage || finalScore
      };
    }).sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));
  };

  useEffect(() => {
    setDiscoveredSchemes(computeMatches(schemes, income, profession, studentStatus));
  }, [schemes, income, profession, studentStatus]);

  const handleDiscover = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/services/discover`, {
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
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setDiscoveredSchemes(data);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn("API Discovery offline, using client-side matching engine.", err);
    }
    
    // Client-side fallback calculation
    setDiscoveredSchemes(computeMatches(schemes, income, profession, studentStatus));
    setLoading(false);
  };

  const handleApplyScheme = async (title: string) => {
    await submitServiceApplication(title, "Benefits Discovery");
    setAppliedSchemeToast(`Application registered for '${title}'! Checked in your tracking portal.`);
    setTimeout(() => setAppliedSchemeToast(null), 4000);
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
                <label className="form-label">Annual Family Income (₹)</label>
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
            
            {appliedSchemeToast && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-xl animate-fade-in">
                {appliedSchemeToast}
              </div>
            )}

            <div className="flex flex-col gap-4 pt-1">
              {loading ? (
                <p className="text-center py-12 text-xs text-[#94A3B8] font-bold animate-pulse">Running compatibility matching index...</p>
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

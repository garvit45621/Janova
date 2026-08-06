'use client';

import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Service } from '../types';

function getFallbackPortalUrl(title: string, category: string, officialUrl?: string): string {
  if (officialUrl) return officialUrl;
  const lower = title.toLowerCase();
  if (lower.includes('birth')) return 'https://crsorgi.gov.in';
  if (lower.includes('aadhaar')) return 'https://uidai.gov.in';
  if (lower.includes('pan')) return 'https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html';
  if (lower.includes('passport')) return 'https://www.passportindia.gov.in';
  if (lower.includes('voter')) return 'https://voters.eci.gov.in';
  if (lower.includes('driving') || lower.includes('license')) return 'https://parivahan.gov.in';
  if (lower.includes('gst')) return 'https://www.gst.gov.in';
  if (lower.includes('udyam') || lower.includes('msme')) return 'https://udyamregistration.gov.in';
  if (lower.includes('income tax') || lower.includes('itr')) return 'https://eportal.incometax.gov.in';
  if (lower.includes('scholarship')) return 'https://scholarships.gov.in';
  if (lower.includes('health') || lower.includes('abha')) return 'https://abha.abdm.gov.in';
  if (lower.includes('kisan')) return 'https://pmkisan.gov.in';
  if (lower.includes('certificate')) return 'https://edistrict.delhigovt.nic.in';
  return 'https://www.india.gov.in/my-government/services';
}

export default function ServicesView() {
  const context = useContext(AppContext);
  if (!context) return null;
  const { services, submitServiceApplication } = context;

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeState, setActiveState] = useState('All');
  const [activeEligibility, setActiveEligibility] = useState('All');
  const [savedServices, setSavedServices] = useState<number[]>([]);
  const [redirectToast, setRedirectToast] = useState<string | null>(null);
  
  // Details Modal
  const [activeModal, setActiveModal] = useState<Service | null>(null);

  const categories = ['All', 'Identity Documents', 'Certificates', 'Education', 'Business', 'Healthcare', 'Taxation', 'Utilities & Housing', 'Welfare & Social Safety', 'Agriculture'];
  const states = ['All', 'Capital Region', 'West Shore', 'North Hills'];
  const eligibilities = ['All', 'Student', 'Homeowner', 'General Citizen'];

  const toggleSaveService = (id: number) => {
    setSavedServices(prev => 
      prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
    );
  };

  const handleLaunchApply = async (srv: Service) => {
    const url = getFallbackPortalUrl(srv.title, srv.category, srv.official_url);
    
    // Register application in background
    await submitServiceApplication(srv.title, srv.category);
    
    // Show quick toast banner
    setRedirectToast(`Redirecting to official website for ${srv.title}...`);
    setTimeout(() => setRedirectToast(null), 4000);

    // Open official portal URL directly in a new window/tab
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const filteredServices = services.filter(srv => {
    const matchesCat = activeCategory === 'All' || srv.category === activeCategory;
    const matchesSearch = srv.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          srv.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-7xl mx-auto w-full animate-scale-in text-left">
      
      {redirectToast && (
        <div className="fixed top-20 right-6 z-50 bg-blue-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-scale-in">
          <span>🚀</span>
          <span>{redirectToast}</span>
        </div>
      )}

      {/* Search and Filters toolbar */}
      <div className="glass-card p-5 flex flex-col gap-5">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <input 
            type="text"
            placeholder="Search government marketplace..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-[#F1F5F9] dark:bg-[#172033] py-3 pl-4 pr-10 text-xs text-[#0F172A] dark:text-[#F8FAFC] border border-transparent focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Categories Tab pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4.5 py-2.5 rounded-full text-xs font-semibold shrink-0 cursor-pointer transition-all border ${
                activeCategory === cat
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-[#0F1626] text-[#475569] dark:text-[#94A3B8] border-[#E2E8F0] dark:border-[#1E293B] hover:bg-[#F1F5F9] dark:hover:bg-[#172033]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Multi filter row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#E2E8F0] dark:border-[#1E293B]/70 pt-4">
          <div className="form-group !mb-0">
            <label className="form-label !text-[10px]">Filter by State Jurisdiction</label>
            <select 
              value={activeState} 
              onChange={(e) => setActiveState(e.target.value)}
              className="form-control text-xs"
            >
              {states.map(st => <option key={st} value={st}>{st}</option>)}
            </select>
          </div>
          <div className="form-group !mb-0">
            <label className="form-label !text-[10px]">Filter by Eligibility Class</label>
            <select 
              value={activeEligibility} 
              onChange={(e) => setActiveEligibility(e.target.value)}
              className="form-control text-xs"
            >
              {eligibilities.map(el => <option key={el} value={el}>{el}</option>)}
            </select>
          </div>
        </div>

      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((srv) => {
          const isSaved = savedServices.includes(srv.id);
          const portalUrl = getFallbackPortalUrl(srv.title, srv.category, srv.official_url);

          return (
            <div key={srv.id} className="glass-card flex flex-col justify-between p-5 gap-5 relative group border border-[#E2E8F0] dark:border-[#1E293B] hover:border-blue-500/50 transition-all">
              <button 
                onClick={() => toggleSaveService(srv.id)}
                className={`absolute top-4 right-4 h-8 w-8 rounded-lg flex items-center justify-center border text-xs cursor-pointer transition-colors ${
                  isSaved ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-white dark:bg-[#0F1626] border-[#E2E8F0] dark:border-[#1E293B] text-slate-400'
                }`}
              >
                {isSaved ? '⭐' : '☆'}
              </button>

              <div className="flex flex-col gap-3.5">
                <span className="badge badge-primary w-fit">{srv.category}</span>
                <div className="flex flex-col gap-1.5">
                  <h4 className="font-heading text-base font-bold">{srv.title}</h4>
                  <p className="text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed">{srv.description}</p>
                </div>
                
                {/* Details snippet */}
                <div className="flex flex-col gap-1 text-[10px] text-[#94A3B8] font-bold">
                  {srv.estimated_time && <div>⏱️ PROCESSING: <span className="text-[#475569] dark:text-[#E2E8F0] font-normal">{srv.estimated_time}</span></div>}
                  {srv.eligibility && <div>🎯 ELIGIBILITY: <span className="text-[#475569] dark:text-[#E2E8F0] font-normal">{srv.eligibility}</span></div>}
                  <div className="truncate text-blue-500 font-mono text-[9px] mt-1">🌐 {portalUrl}</div>
                </div>
              </div>

              <div className="border-t border-[#E2E8F0]/50 dark:border-[#1E293B]/50 pt-4 mt-2 flex gap-2">
                <button 
                  onClick={() => handleLaunchApply(srv)}
                  className="btn btn-primary text-xs flex-1 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Apply Online</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </button>

                <button 
                  onClick={() => setActiveModal(srv)}
                  className="btn btn-secondary text-xs cursor-pointer"
                >
                  Details
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* SERVICE DETAILS MODAL */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#080D1A]/50 backdrop-blur-sm" onClick={() => setActiveModal(null)} />
          
          <div className="glass rounded-2xl w-full max-w-lg shadow-2xl p-6 relative border border-[#E2E8F0]/30 dark:border-[#1E293B]/40 z-10 animate-scale-in flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3">
              <div className="flex flex-col">
                <h3 className="font-heading text-sm font-bold">{activeModal.title}</h3>
                <span className="text-[10px] text-[#94A3B8] uppercase font-bold mt-0.5">{activeModal.category}</span>
              </div>
              <button onClick={() => setActiveModal(null)}>✕</button>
            </div>

            <div className="flex flex-col gap-4 text-xs text-[#475569] dark:text-[#94A3B8]">
              <p className="leading-relaxed">{activeModal.description}</p>
              
              {activeModal.eligibility && (
                <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                  <div className="font-bold text-blue-500 text-[11px] mb-1">Eligibility Criteria</div>
                  <div>{activeModal.eligibility}</div>
                </div>
              )}

              {activeModal.required_documents && activeModal.required_documents.length > 0 && (
                <div>
                  <div className="font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">Required Documents:</div>
                  <ul className="list-disc list-inside flex flex-col gap-1 text-[11px]">
                    {activeModal.required_documents.map((doc, idx) => (
                      <li key={idx}>{doc}</li>
                    ))}
                  </ul>
                </div>
              )}

              {activeModal.application_steps && activeModal.application_steps.length > 0 && (
                <div>
                  <div className="font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">Application Process Steps:</div>
                  <ol className="list-decimal list-inside flex flex-col gap-1 text-[11px]">
                    {activeModal.application_steps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>

            <div className="flex justify-between gap-3 border-t border-[#E2E8F0] dark:border-[#1E293B] pt-4 mt-2">
              <button type="button" onClick={() => setActiveModal(null)} className="btn btn-secondary flex-1">
                Close
              </button>
              <button 
                type="button" 
                onClick={() => {
                  const srv = activeModal;
                  setActiveModal(null);
                  handleLaunchApply(srv);
                }} 
                className="btn btn-primary flex-1 flex items-center justify-center gap-1.5"
              >
                <span>Go to Official Website</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


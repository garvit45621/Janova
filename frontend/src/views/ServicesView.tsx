'use client';

import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Service } from '../types';

export default function ServicesView() {
  const context = useContext(AppContext);
  if (!context) return null;
  const { services, submitServiceApplication } = context;

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeState, setActiveState] = useState('All');
  const [activeEligibility, setActiveEligibility] = useState('All');
  const [savedServices, setSavedServices] = useState<number[]>([]);
  
  // Modal application triggers
  const [activeModal, setActiveModal] = useState<Service | null>(null);
  const [modalStep, setModalStep] = useState(1);
  const [formInputs, setFormInputs] = useState({ identifier: '', checkAgreement: false });
  const [error, setError] = useState('');

  const categories = ['All', 'Identity Documents', 'Certificates', 'Education', 'Business', 'Healthcare', 'Taxation'];
  const states = ['All', 'Capital Region', 'West Shore', 'North Hills'];
  const eligibilities = ['All', 'Student', 'Homeowner', 'General Citizen'];

  const toggleSaveService = (id: number) => {
    setSavedServices(prev => 
      prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
    );
  };

  const handleLaunchApply = (srv: Service) => {
    setActiveModal(srv);
    setModalStep(1);
    setFormInputs({ identifier: '', checkAgreement: false });
    setError('');
  };

  const handleNextStep = () => {
    if (modalStep === 1) {
      if (!formInputs.identifier) {
        setError('Please provide validation identifier.');
        return;
      }
      setModalStep(2);
      setError('');
    }
  };

  const handleSubmit = async () => {
    if (!formInputs.checkAgreement) {
      setError('Please acknowledge policy terms.');
      return;
    }

    if (activeModal) {
      await submitServiceApplication(activeModal.title, activeModal.category);
      setActiveModal(null);
    }
  };

  const filteredServices = services.filter(srv => {
    const matchesCat = activeCategory === 'All' || srv.category === activeCategory;
    const matchesSearch = srv.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          srv.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-7xl mx-auto w-full animate-scale-in text-left">
      
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
          return (
            <div key={srv.id} className="glass-card flex flex-col justify-between p-5 gap-5 relative group">
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
                
                {/* Details checklist snippet */}
                <div className="flex flex-col gap-1 text-[10px] text-[#94A3B8] font-bold">
                  {srv.estimated_time && <div>⏱️ PROCESSING: <span className="text-[#475569] dark:text-[#E2E8F0] font-normal">{srv.estimated_time}</span></div>}
                  {srv.eligibility && <div>🎯 ELIGIBILITY: <span className="text-[#475569] dark:text-[#E2E8F0] font-normal">{srv.eligibility}</span></div>}
                </div>
              </div>

              <div className="border-t border-[#E2E8F0]/50 dark:border-[#1E293B]/50 pt-4 mt-2 flex gap-3">
                <button 
                  onClick={() => handleLaunchApply(srv)}
                  className="btn btn-primary text-xs flex-1 cursor-pointer"
                >
                  Apply Online
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL APPLICATION DRAWER */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#080D1A]/50 backdrop-blur-sm" onClick={() => setActiveModal(null)} />
          
          <div className="glass rounded-2xl w-full max-w-md shadow-2xl p-6 relative border border-[#E2E8F0]/30 dark:border-[#1E293B]/40 z-10 animate-scale-in flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3">
              <div className="flex flex-col">
                <h3 className="font-heading text-sm font-bold">{activeModal.title}</h3>
                <span className="text-[10px] text-[#94A3B8] uppercase font-bold mt-0.5">Application Step {modalStep} of 2</span>
              </div>
              <button onClick={() => setActiveModal(null)}>✕</button>
            </div>

            {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-[10px] font-semibold text-red-500">{error}</div>}

            <div className="flex-1 py-2">
              {modalStep === 1 && (
                <div className="flex flex-col gap-4 animate-scale-in">
                  <p className="text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed">
                    Provide your current identifier details to verify registry records.
                  </p>
                  <div className="form-group">
                    <label className="form-label">Government Identification ID Number</label>
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder="e.g. ID-8823102"
                      value={formInputs.identifier}
                      onChange={(e) => { setFormInputs(prev => ({ ...prev, identifier: e.target.value })); setError(''); }}
                    />
                  </div>
                </div>
              )}

              {modalStep === 2 && (
                <div className="flex flex-col gap-4 animate-scale-in">
                  <p className="text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed">
                    Acknowledge the terms of application processing under regional policy terms.
                  </p>
                  <div className="p-3 rounded-lg bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#1E293B] text-[10px] text-[#475569] dark:text-[#94A3B8] leading-relaxed">
                    By submitting this form, you authorize regional registry officers to access linked documents inside your secure Document Vault for verification audits.
                  </div>
                  <label className="form-checkbox text-xs font-semibold mt-2">
                    <input 
                      type="checkbox"
                      checked={formInputs.checkAgreement}
                      onChange={(e) => { setFormInputs(prev => ({ ...prev, checkAgreement: e.target.checked })); setError(''); }}
                    />
                    Acknowledge processing policies
                  </label>
                </div>
              )}
            </div>

            <div className="flex justify-between gap-4 border-t border-[#E2E8F0] dark:border-[#1E293B] pt-4 mt-2">
              {modalStep > 1 && (
                <button type="button" onClick={() => { setModalStep(s => s - 1); setError(''); }} className="btn btn-secondary flex-1">
                  Back
                </button>
              )}
              {modalStep < 2 ? (
                <button type="button" onClick={handleNextStep} className="btn btn-primary flex-1">
                  Continue
                </button>
              ) : (
                <button type="button" onClick={handleSubmit} className="btn btn-primary flex-1">
                  Submit Application
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

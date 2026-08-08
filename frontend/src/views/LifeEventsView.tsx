'use client';

import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { LifeEvent } from '../types';
import { API_BASE_URL } from '../config/api';

export default function LifeEventsView() {
  const context = useContext(AppContext);
  if (!context) return null;
  const { user, lifeEvents } = context;

  const [activeEvent, setActiveEvent] = useState<LifeEvent | null>(null);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (lifeEvents.length > 0 && !activeEvent) {
      setActiveEvent(lifeEvents[0]);
    }
  }, [lifeEvents]);

  // Load checklist whenever activeEvent changes
  useEffect(() => {
    if (activeEvent && user) {
      fetchChecklist();
    }
  }, [activeEvent, user]);

  const fetchChecklist = async () => {
    if (!activeEvent || !user) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/services/life-events/checklist/${user.id}/${activeEvent.id}`);
      if (res.ok) {
        const data = await res.json();
        setChecklist(data.checked_items || {});
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleCheck = async (key: string) => {
    if (!activeEvent || !user) return;
    const updated = { ...checklist, [key]: !checklist[key] };
    setChecklist(updated);

    try {
      await fetch(`${API_BASE_URL}/api/services/life-events/checklist`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          life_event_id: activeEvent.id,
          checked_items: updated
        })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const calculateProgress = () => {
    if (!activeEvent) return 0;
    const total = activeEvent.required_registrations.length + activeEvent.services_needed.length + activeEvent.documents_required.length;
    if (total === 0) return 0;

    let checked = 0;
    Object.keys(checklist).forEach(k => {
      if (checklist[k]) checked++;
    });

    return Math.round((checked / total) * 100);
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-7xl mx-auto w-full animate-scale-in text-left">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Life Events selector grid (Col: 4) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="glass-card p-5 flex flex-col gap-4">
            <h3 className="font-heading text-sm font-bold border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3">Life Event Roadmaps</h3>
            <div className="flex flex-col gap-2.5 max-h-[400px] overflow-y-auto pr-1">
              {lifeEvents.map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => setActiveEvent(ev)}
                  className={`flex flex-col text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                    activeEvent?.id === ev.id
                      ? 'border-blue-500 bg-blue-500/5 shadow-sm'
                      : 'border-[#E2E8F0] dark:border-[#1E293B] hover:bg-slate-50 dark:hover:bg-[#172033]'
                  }`}
                >
                  <span className="text-xs font-bold">{ev.name}</span>
                  <span className="text-[10px] text-[#94A3B8] leading-normal mt-1 line-clamp-2">{ev.description}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Interactive milestones roadmap (Col: 8) */}
        {activeEvent && (
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Header info */}
            <div className="glass-card p-5 flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3">
                <div className="flex flex-col">
                  <h3 className="font-heading text-base font-bold">{activeEvent.name}</h3>
                  <span className="text-[10px] text-[#94A3B8] uppercase font-bold mt-0.5">Timeline: {activeEvent.timeline_est}</span>
                </div>
                
                {/* Progress bar */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-blue-500">{calculateProgress()}% Complete</span>
                  <div className="h-2 w-24 bg-[#E2E8F0] dark:bg-[#172033] rounded-full overflow-hidden shrink-0">
                    <div className="h-full bg-blue-600 rounded-full transition-all duration-300" style={{ width: `${calculateProgress()}%` }} />
                  </div>
                </div>
              </div>

              {/* Roadmap Timeline */}
              <div className="relative flex flex-col gap-6 pl-6 border-l-2 border-[#E2E8F0] dark:border-[#1E293B] ml-3 pt-2">
                
                {/* 1. Required registrations */}
                {activeEvent.required_registrations.map((reg, idx) => {
                  const key = `reg-${reg}`;
                  const isChecked = checklist[key] || false;
                  return (
                    <div key={idx} className="relative flex items-center justify-between gap-4">
                      
                      {/* Timeline node */}
                      <button 
                        onClick={() => handleToggleCheck(key)}
                        className={`absolute -left-[35px] h-6 w-6 rounded-full flex items-center justify-center border-2 text-[10px] font-bold transition-all cursor-pointer ${
                          isChecked 
                            ? 'bg-emerald-500 border-emerald-500 text-white scale-110' 
                            : 'bg-white dark:bg-[#0F1626] border-[#94A3B8] text-slate-400'
                        }`}
                      >
                        {isChecked ? '✓' : idx + 1}
                      </button>

                      <div className={`p-4 rounded-xl border flex-1 flex justify-between items-center transition-colors ${
                        isChecked ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-50 dark:bg-slate-800/40 border-[#E2E8F0] dark:border-[#1E293B]/70'
                      }`}>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold">{reg}</span>
                          <span className="text-[9px] text-[#94A3B8] uppercase font-bold mt-1">1. Legal Registry</span>
                        </div>
                        
                        <button 
                          onClick={() => handleToggleCheck(key)} 
                          className="btn btn-secondary !py-1 !px-3 text-[10px] font-bold"
                        >
                          {isChecked ? 'Done' : 'Mark Done'}
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* 2. Services Needed */}
                {activeEvent.services_needed.map((srv, idx) => {
                  const key = `srv-${srv}`;
                  const isChecked = checklist[key] || false;
                  const regLength = activeEvent.required_registrations.length;
                  return (
                    <div key={idx} className="relative flex items-center justify-between gap-4">
                      
                      <button 
                        onClick={() => handleToggleCheck(key)}
                        className={`absolute -left-[35px] h-6 w-6 rounded-full flex items-center justify-center border-2 text-[10px] font-bold transition-all cursor-pointer ${
                          isChecked 
                            ? 'bg-emerald-500 border-emerald-500 text-white scale-110' 
                            : 'bg-white dark:bg-[#0F1626] border-[#94A3B8] text-slate-400'
                        }`}
                      >
                        {isChecked ? '✓' : regLength + idx + 1}
                      </button>

                      <div className={`p-4 rounded-xl border flex-1 flex justify-between items-center transition-colors ${
                        isChecked ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-50 dark:bg-slate-800/40 border-[#E2E8F0] dark:border-[#1E293B]/70'
                      }`}>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold">{srv}</span>
                          <span className="text-[9px] text-[#94A3B8] uppercase font-bold mt-1">2. Core Service Application</span>
                        </div>
                        
                        <button 
                          onClick={() => handleToggleCheck(key)} 
                          className="btn btn-secondary !py-1 !px-3 text-[10px] font-bold"
                        >
                          {isChecked ? 'Done' : 'Mark Done'}
                        </button>
                      </div>
                    </div>
                  );
                })}

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

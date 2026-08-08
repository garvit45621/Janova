'use client';

import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { DonutChart, BarChart, LineChart } from '../components/CustomCharts';

export default function DashboardView() {
  const context = useContext(AppContext);
  if (!context) return null;
  const { 
    user, 
    applications, 
    documents, 
    complaints, 
    deadlines, 
    schemes, 
    setActiveView,
    createPersonalDeadline,
    submitServiceApplication
  } = context;

  // Interactive local states
  const [activeAppFilter, setActiveAppFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [expandedAppId, setExpandedAppId] = useState<number | null>(null);
  const [showAddDeadlineModal, setShowAddDeadlineModal] = useState(false);
  const [newDeadlineTitle, setNewDeadlineTitle] = useState('');
  const [newDeadlineDate, setNewDeadlineDate] = useState('');
  const [newDeadlineUrgency, setNewDeadlineUrgency] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [advisoryDismissed, setAdvisoryDismissed] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // 1. Calculations for alerts
  const expiringDocs = documents.filter(d => {
    if (!d.expiry_date) return false;
    const daysLeft = Math.round((new Date(d.expiry_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    return daysLeft <= 30 && daysLeft >= 0;
  });

  const handleCopyCitizenId = () => {
    if (user?.citizenId) {
      navigator.clipboard.writeText(user.citizenId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2500);
    }
  };

  const handleCreateDeadlineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeadlineTitle || !newDeadlineDate) return;
    await createPersonalDeadline(newDeadlineTitle, newDeadlineDate, 'General', newDeadlineUrgency);
    setNewDeadlineTitle('');
    setNewDeadlineDate('');
    setShowAddDeadlineModal(false);
  };

  // Filtered applications
  const filteredApps = applications.filter(app => {
    if (activeAppFilter === 'pending') return app.status !== 'approved';
    if (activeAppFilter === 'approved') return app.status === 'approved';
    return true;
  });

  // Prepare SVG charts metrics
  const appStatusCount = { approved: 0, reviewing: 0, pending: 0 };
  applications.forEach(a => {
    const st = a.status?.toLowerCase();
    if (st === 'approved') appStatusCount.approved++;
    else if (st === 'reviewing' || st === 'investigating') appStatusCount.reviewing++;
    else appStatusCount.pending++;
  });

  const donutData = [
    { label: "Approved", value: appStatusCount.approved, color: "#10B981" },
    { label: "Reviewing", value: appStatusCount.reviewing, color: "#3B82F6" },
    { label: "Pending", value: appStatusCount.pending, color: "#F59E0B" }
  ];

  const categoryCounts: Record<string, number> = {};
  complaints.forEach(c => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
  });
  const barData = Object.keys(categoryCounts).map(cat => ({
    label: cat,
    value: categoryCounts[cat],
    color: cat.includes('Pothole') ? '#EF4444' : cat.includes('Water') ? '#3B82F6' : '#10B981'
  }));

  const transparencySpend = [
    { label: "Jan", value: 320000 },
    { label: "Feb", value: 410000 },
    { label: "Mar", value: 380000 },
    { label: "Apr", value: 550000 },
    { label: "May", value: 680000 }
  ];

  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-7xl mx-auto w-full animate-scale-in text-left">
      
      {/* Interactive Quick Action Pill Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs font-semibold text-[#475569] dark:text-[#94A3B8]">
        <span className="text-[10px] uppercase tracking-wider font-extrabold text-blue-500 shrink-0">⚡ Quick Actions:</span>
        
        <button 
          onClick={() => setActiveView('services')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 hover:bg-blue-500/10 hover:text-blue-500 border border-[#E2E8F0] dark:border-[#1E293B] transition-all cursor-pointer shrink-0"
        >
          <span>📜</span> Services
        </button>

        <button 
          onClick={() => setActiveView('benefits')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 hover:bg-emerald-500/10 hover:text-emerald-500 border border-[#E2E8F0] dark:border-[#1E293B] transition-all cursor-pointer shrink-0"
        >
          <span>🎁</span> Benefits
        </button>

        <button 
          onClick={() => setActiveView('vault')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 hover:bg-amber-500/10 hover:text-amber-500 border border-[#E2E8F0] dark:border-[#1E293B] transition-all cursor-pointer shrink-0"
        >
          <span>📂</span> Vault
        </button>

        <button 
          onClick={() => setActiveView('business')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 hover:bg-indigo-500/10 hover:text-indigo-500 border border-[#E2E8F0] dark:border-[#1E293B] transition-all cursor-pointer shrink-0"
        >
          <span>🏢</span> Business
        </button>

        <button 
          onClick={() => setActiveView('complaints')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 hover:bg-red-500/10 hover:text-red-500 border border-[#E2E8F0] dark:border-[#1E293B] transition-all cursor-pointer shrink-0"
        >
          <span>🗺️</span> Complaints Map
        </button>

        <button 
          onClick={() => setActiveView('voice')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 hover:bg-cyan-500/10 hover:text-cyan-500 border border-[#E2E8F0] dark:border-[#1E293B] transition-all cursor-pointer shrink-0"
        >
          <span>🗣️</span> Janova Vani AI
        </button>
      </div>

      {/* Re-engineered Subtle Welcome Hero Card */}
      <div className="relative rounded-3xl bg-gradient-to-r from-blue-900/10 via-slate-900/5 to-indigo-900/10 dark:from-blue-950/40 dark:via-slate-900/40 dark:to-indigo-950/40 border border-blue-500/20 p-6 md:p-8 backdrop-blur-xl shadow-xl overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col gap-2 z-10">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-extrabold tracking-widest text-blue-600 dark:text-blue-400 uppercase">STATE VERIFIED CITIZEN PORTAL</span>
          </div>

          <h2 className="font-heading text-2xl md:text-3xl font-black text-[#0F172A] dark:text-white">
            Welcome back, {user?.name || 'Citizen'}
          </h2>

          <div className="flex items-center gap-3 text-xs text-[#64748B] dark:text-[#94A3B8]">
            <span>Citizen ID: <strong className="text-[#0F172A] dark:text-slate-200 font-mono">{user?.citizenId}</strong></span>
            <button 
              onClick={handleCopyCitizenId}
              className="text-[10px] font-bold text-blue-500 hover:underline cursor-pointer"
            >
              {copiedId ? '✓ Copied' : '📋 Copy ID'}
            </button>
            <span>•</span>
            <span className="text-emerald-500 font-bold">🛡️ Verified Account</span>
          </div>
        </div>

        {/* Hero Actions */}
        <div className="flex items-center gap-3 z-10 shrink-0">
          <button 
            onClick={() => setActiveView('emergency')} 
            className="btn bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 text-xs font-bold flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer transition-all hover:scale-105"
          >
            <span className="animate-pulse">🚨</span>
            <span>Emergency Protocols</span>
          </button>
          
          <button 
            onClick={() => setActiveView('services')} 
            className="btn btn-primary px-5 py-2.5 text-xs font-bold shadow-lg shadow-blue-500/20 flex items-center gap-2 transform hover:-translate-y-0.5 transition-all"
          >
            <span>🚀</span>
            <span>Explore Services</span>
          </button>
        </div>
      </div>

      {/* Emergency Flash Alert Advisory Banner */}
      {!advisoryDismissed && (
        <div className="rounded-2xl bg-red-500/10 border border-red-500/25 p-4 flex items-center justify-between gap-4 text-left transition-all hover:border-red-500/40">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 rounded-full bg-red-500 animate-ping shrink-0" />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-black text-red-600 dark:text-red-400">CRITICAL CIVIC ADVISORY: Flash Flooding Alert</span>
              <span className="text-[11px] text-[#475569] dark:text-red-200/80">Bengaluru Urban & Low-Lying Eastern Districts • Tap to view emergency protocols & shelters</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={() => setActiveView('emergency')}
              className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
            >
              View Shelters →
            </button>
            <button 
              onClick={() => setAdvisoryDismissed(true)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Widget 1: Active Applications with Interactive Filter & Expand */}
        <div className="glass-card p-5 flex flex-col gap-4 text-left">
          <div className="border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3 flex justify-between items-center">
            <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Active Applications</span>
            
            {/* Interactive Filter Pills */}
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[9px] font-bold">
              {(['all', 'pending', 'approved'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveAppFilter(filter)}
                  className={`px-2 py-0.5 rounded-md capitalize cursor-pointer transition-all ${
                    activeAppFilter === filter 
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-extrabold shadow-xs' 
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 flex-1">
            {filteredApps.slice(0, 3).map((app) => (
              <div 
                key={app.id} 
                onClick={() => setExpandedAppId(expandedAppId === app.id ? null : app.id)}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-[#E2E8F0] dark:border-[#1E293B] flex flex-col gap-2 hover:border-blue-500/40 transition-all cursor-pointer"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#0F172A] dark:text-white">{app.title}</span>
                  <span className="font-extrabold text-blue-500">{app.progress}%</span>
                </div>

                <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full transition-all duration-300" style={{ width: `${app.progress}%` }} />
                </div>

                {/* Expandable Status Drawer */}
                {expandedAppId === app.id && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 text-[10px] text-slate-500 dark:text-slate-400 flex flex-col gap-1 animate-fade-in">
                    <span className="font-bold text-blue-500">Current Status: {app.status?.toUpperCase()}</span>
                    <span>Category: {app.category}</span>
                    <span>Submitted: {new Date(app.created_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            ))}
            {filteredApps.length === 0 && <p className="text-xs text-[#94A3B8] text-center py-6">No matching applications</p>}
          </div>
        </div>

        {/* Widget 2: Available Benefits with Direct Apply */}
        <div className="glass-card p-5 flex flex-col gap-4 text-left">
          <div className="border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3 flex justify-between items-center">
            <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Available Benefits</span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              {schemes.length} Recommended
            </span>
          </div>

          <div className="flex flex-col gap-3 justify-center flex-1">
            {schemes.slice(0, 2).map((sch) => (
              <div key={sch.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between text-xs hover:border-emerald-500/40 transition-all">
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-[#0F172A] dark:text-white">{sch.title}</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">{sch.amount}</span>
                </div>
                <button 
                  onClick={() => submitServiceApplication(`Benefit Claim: ${sch.title}`, "Welfare")}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500 text-white text-[10px] font-bold shadow-xs hover:bg-emerald-600 cursor-pointer transition-all shrink-0"
                >
                  Claim
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Widget 3: Upcoming Deadlines with Inline Creator */}
        <div className="glass-card p-5 flex flex-col gap-4 text-left">
          <div className="border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3 flex justify-between items-center">
            <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Upcoming Deadlines</span>
            <button 
              onClick={() => setShowAddDeadlineModal(!showAddDeadlineModal)}
              className="text-[10px] font-bold text-blue-500 hover:underline cursor-pointer"
            >
              {showAddDeadlineModal ? 'Cancel' : '+ Add Deadline'}
            </button>
          </div>

          {showAddDeadlineModal ? (
            <form onSubmit={handleCreateDeadlineSubmit} className="flex flex-col gap-2 animate-fade-in">
              <input
                type="text"
                placeholder="Deadline Title..."
                value={newDeadlineTitle}
                onChange={(e) => setNewDeadlineTitle(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#0F1626]"
              />
              <input
                type="date"
                value={newDeadlineDate}
                onChange={(e) => setNewDeadlineDate(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#0F1626]"
              />
              <button type="submit" className="btn btn-primary py-1.5 text-xs font-bold">
                Save Deadline
              </button>
            </form>
          ) : (
            <div className="flex flex-col gap-3 justify-center flex-1">
              {deadlines.slice(0, 2).map((dl) => (
                <div key={dl.id} className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-[#E2E8F0] dark:border-[#1E293B]">
                  <div className="flex flex-col">
                    <span className="font-bold text-[#0F172A] dark:text-white">{dl.title}</span>
                    <span className="text-[9px] uppercase tracking-wider font-bold text-amber-500">{dl.urgency} Priority</span>
                  </div>
                  <span className="font-bold text-slate-600 dark:text-slate-300">{dl.date}</span>
                </div>
              ))}
              {deadlines.length === 0 && <p className="text-xs text-[#94A3B8] text-center py-4">No upcoming deadlines</p>}
            </div>
          )}
        </div>

      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DonutChart data={donutData} title="Applications Status Breakdown" />
        <BarChart data={barData.length > 0 ? barData : [{ label: 'Safety', value: 3 }, { label: 'Roads', value: 5 }]} title="Neighborhood Issues Registered" />
        <LineChart data={transparencySpend} title="Municipal Transparency Index (₹)" />
      </div>

      {/* Lower Actions Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Quick Shortcuts Grid (Col: 5) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="glass-card p-5 flex flex-col gap-4 text-left">
            <h3 className="font-heading text-sm font-bold border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3">Quick Shortcuts</h3>
            <div className="grid grid-cols-2 gap-3.5 pt-1 text-center text-xs font-bold">
              
              <button 
                onClick={() => setActiveView('services')} 
                className="flex flex-col items-center gap-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-[#E2E8F0] dark:border-[#1E293B] hover:border-blue-500 hover:text-blue-500 cursor-pointer transition-all hover:scale-[1.02]"
              >
                <span className="text-xl bg-blue-500/10 p-2 rounded-xl">📜</span>
                <span>Apply for Certificate</span>
              </button>

              <button 
                onClick={() => setActiveView('benefits')} 
                className="flex flex-col items-center gap-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-[#E2E8F0] dark:border-[#1E293B] hover:border-emerald-500 hover:text-emerald-500 cursor-pointer transition-all hover:scale-[1.02]"
              >
                <span className="text-xl bg-emerald-500/10 p-2 rounded-xl">🎁</span>
                <span>Find Benefits</span>
              </button>

              <button 
                onClick={() => setActiveView('vault')} 
                className="flex flex-col items-center gap-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-[#E2E8F0] dark:border-[#1E293B] hover:border-amber-500 hover:text-amber-500 cursor-pointer transition-all hover:scale-[1.02]"
              >
                <span className="text-xl bg-amber-500/10 p-2 rounded-xl">📂</span>
                <span>Upload Documents</span>
              </button>

              <button 
                onClick={() => setActiveView('business')} 
                className="flex flex-col items-center gap-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-[#E2E8F0] dark:border-[#1E293B] hover:border-indigo-500 hover:text-indigo-500 cursor-pointer transition-all hover:scale-[1.02]"
              >
                <span className="text-xl bg-indigo-500/10 p-2 rounded-xl">🏢</span>
                <span>Register Business</span>
              </button>

              <button 
                onClick={() => setActiveView('complaints')} 
                className="flex flex-col items-center gap-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-[#E2E8F0] dark:border-[#1E293B] hover:border-red-500 hover:text-red-500 cursor-pointer transition-all hover:scale-[1.02] col-span-2"
              >
                <span className="text-xl bg-red-500/10 p-2 rounded-xl">🗺️</span>
                <span>Report Civic Issue on GIS Map</span>
              </button>

            </div>
          </div>
        </div>

        {/* Recent Timeline Trackers (Col: 7) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="glass-card p-5 flex flex-col gap-4 text-left">
            <h3 className="font-heading text-sm font-bold border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3">Recent Application Timelines</h3>
            <div className="flex flex-col gap-3.5 pt-1">
              {applications.slice(0, 3).map((app) => (
                <div key={app.id} className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#172033] border border-[#E2E8F0] dark:border-[#1E293B] flex flex-col gap-3">
                  <div className="flex justify-between items-start text-xs">
                    <div className="flex flex-col">
                      <span className="font-bold text-[#0F172A] dark:text-white">{app.title}</span>
                      <span className="text-[10px] text-[#94A3B8]">ID: {app.id} • {app.category}</span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg border text-[9px] font-extrabold uppercase ${
                      app.status === 'approved' 
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' 
                        : 'bg-blue-500/10 text-blue-500 border-blue-500/30'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                  
                  {app.history && app.history.length > 0 && (
                    <div className="text-[11px] text-[#475569] dark:text-[#94A3B8] border-t border-[#E2E8F0]/40 dark:border-[#1E293B]/40 pt-2 flex items-center gap-2">
                      <span className="h-2 w-2 bg-blue-500 rounded-full shrink-0" />
                      <span className="font-bold text-blue-500">{app.history[app.history.length - 1].status}:</span>
                      <span>{app.history[app.history.length - 1].desc}</span>
                    </div>
                  )}
                </div>
              ))}
              {applications.length === 0 && <p className="text-xs text-[#94A3B8] text-center py-6">No application trackers logged yet.</p>}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

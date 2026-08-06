'use client';

import React, { useContext } from 'react';
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
    services, 
    setActiveView 
  } = context;

  // 1. Calculations for alerts
  const expiringDocs = documents.filter(d => {
    if (!d.expiry_date) return false;
    const daysLeft = Math.round((new Date(d.expiry_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    return daysLeft <= 30 && daysLeft >= 0;
  });

  // Available Benefits
  const eligibleSchemesCount = schemes.length;

  // 2. Prepare SVG charts metrics
  const appStatusCount = { approved: 0, reviewing: 0, pending: 0 };
  applications.forEach(a => {
    if (appStatusCount[a.status] !== undefined) appStatusCount[a.status]++;
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
    color: '#06B6D4'
  }));

  const transparencySpend = [
    { label: "Jan", value: 32000 },
    { label: "Feb", value: 41000 },
    { label: "Mar", value: 38000 },
    { label: "Apr", value: 55000 },
    { label: "May", value: 68000 }
  ];

  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-7xl mx-auto w-full animate-scale-in">
      
      {/* Welcome Banner */}
      <div className="glass-card bg-gradient-to-r from-blue-700/10 to-cyan-500/10 dark:from-blue-700/15 dark:to-cyan-500/15 border-blue-500/20 p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex flex-col gap-1.5 text-left">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">Welcome back, {user?.name}</h2>
          <span className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider">
            Citizen ID: {user?.citizenId} • State Level verified account
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveView('emergency')} className="btn bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer">
            <span>🚨</span> Emergency Hub
          </button>
          <button onClick={() => setActiveView('services')} className="btn btn-primary shadow-lg shadow-blue-500/15">
            Apply for Services
          </button>
        </div>
      </div>

      {/* Emergency Flash Alert Banner */}
      <div 
        onClick={() => setActiveView('emergency')}
        className="rounded-2xl bg-red-950/40 border border-red-500/30 p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-red-950/60 transition-all text-left"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-3 w-3 rounded-full bg-red-500 animate-ping shrink-0" />
          <div className="flex flex-col">
            <span className="text-xs font-extrabold text-red-400">CRITICAL CIVIC ADVISORY: Flash Flooding Alert</span>
            <span className="text-[10px] text-red-200/70">Bengaluru Urban & Low-Lying Eastern Districts • Tap to view emergency protocols & shelters</span>
          </div>
        </div>
        <span className="text-xs font-bold text-red-400 shrink-0">View Emergency Hub →</span>
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Widget 1: Active Applications */}
        <div className="glass-card p-5 flex flex-col gap-4 text-left">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex justify-between items-center">
            <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Active Applications</span>
            <span className="badge badge-primary">{applications.filter(a => a.status !== 'approved').length} Active</span>
          </div>
          <div className="flex flex-col gap-3.5 flex-1 justify-center">
            {applications.slice(0, 2).map((app) => (
              <div key={app.id} className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold">{app.title}</span>
                  <span className="font-semibold text-blue-500">{app.progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-[#E2E8F0] dark:bg-[#1E293B] rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600" style={{ width: `${app.progress}%` }} />
                </div>
              </div>
            ))}
            {applications.length === 0 && <p className="text-xs text-[#94A3B8] text-center py-4">No active applications</p>}
          </div>
        </div>

        {/* Widget 2: Available Benefits */}
        <div className="glass-card p-5 flex flex-col gap-4 text-left">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex justify-between items-center">
            <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Available Benefits</span>
            <span className="badge badge-success">{eligibleSchemesCount} Available</span>
          </div>
          <div className="flex flex-col gap-3 justify-center flex-1">
            {schemes.slice(0, 2).map((sch) => (
              <div key={sch.id} className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-xs">
                <div className="flex flex-col">
                  <span className="font-bold">{sch.title}</span>
                  <span className="text-[10px] text-[#94A3B8]">{sch.category}</span>
                </div>
                <span className="font-bold text-emerald-500">{sch.amount}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Widget 3: Upcoming Deadlines */}
        <div className="glass-card p-5 flex flex-col gap-4 text-left">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex justify-between items-center">
            <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Upcoming Deadlines</span>
            <span className="badge badge-danger">{deadlines.length} Alert</span>
          </div>
          <div className="flex flex-col gap-3 justify-center flex-1">
            {deadlines.slice(0, 2).map((dl) => (
              <div key={dl.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                <div className="flex flex-col">
                  <span className="font-bold">{dl.title}</span>
                  <span className="text-[9px] uppercase tracking-wider font-bold text-red-500">{dl.urgency} Priority</span>
                </div>
                <span className="font-semibold">{dl.date}</span>
              </div>
            ))}
            {deadlines.length === 0 && <p className="text-xs text-[#94A3B8] text-center py-4">No upcoming deadlines</p>}
          </div>
        </div>

      </div>

      {/* Analytics charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DonutChart data={donutData} title="Applications Status Breakdown" />
        <BarChart data={barData.length > 0 ? barData : [{ label: 'Safety', value: 3 }, { label: 'Roads', value: 5 }]} title="Neighborhood Issues Registered" />
        <LineChart data={transparencySpend} title="Municipal Transparency Index ($)" />
      </div>

      {/* Lower Actions panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Quick Actions Shortcuts (Col: 5) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="glass-card p-5 flex flex-col gap-4 text-left">
            <h3 className="font-heading text-sm font-bold border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3">Quick Shortcuts</h3>
            <div className="grid grid-cols-2 gap-3.5 pt-2 text-center text-xs font-bold">
              
              <button onClick={() => setActiveView('services')} className="flex flex-col items-center gap-2.5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-[#E2E8F0] dark:border-[#1E293B] hover:border-blue-500 hover:text-blue-500 cursor-pointer transition-colors">
                <span className="text-lg bg-blue-500/10 p-2 rounded-lg">📜</span>
                <span>Apply for Certificate</span>
              </button>

              <button onClick={() => setActiveView('benefits')} className="flex flex-col items-center gap-2.5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-[#E2E8F0] dark:border-[#1E293B] hover:border-blue-500 hover:text-blue-500 cursor-pointer transition-colors">
                <span className="text-lg bg-emerald-500/10 p-2 rounded-lg">🎁</span>
                <span>Find Benefits</span>
              </button>

              <button onClick={() => setActiveView('vault')} className="flex flex-col items-center gap-2.5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-[#E2E8F0] dark:border-[#1E293B] hover:border-blue-500 hover:text-blue-500 cursor-pointer transition-colors">
                <span className="text-lg bg-amber-500/10 p-2 rounded-lg">📂</span>
                <span>Upload Documents</span>
              </button>

              <button onClick={() => setActiveView('business')} className="flex flex-col items-center gap-2.5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-[#E2E8F0] dark:border-[#1E293B] hover:border-blue-500 hover:text-blue-500 cursor-pointer transition-colors">
                <span className="text-lg bg-indigo-500/10 p-2 rounded-lg">🏢</span>
                <span>Register Business</span>
              </button>

              <button onClick={() => setActiveView('complaints')} className="flex flex-col items-center gap-2.5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-[#E2E8F0] dark:border-[#1E293B] hover:border-blue-500 hover:text-blue-500 cursor-pointer transition-colors col-span-2">
                <span className="text-lg bg-red-500/10 p-2 rounded-lg">🗺️</span>
                <span>Report Civic Issue</span>
              </button>

            </div>
          </div>
        </div>

        {/* Recent timeline trackers & suggested services (Col: 7) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Applications list */}
          <div className="glass-card p-5 flex flex-col gap-4 text-left">
            <h3 className="font-heading text-sm font-bold border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3">Recent Progress Timelines</h3>
            <div className="flex flex-col gap-4 pt-2">
              {applications.slice(0, 3).map((app) => (
                <div key={app.id} className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#172033] border border-[#E2E8F0] dark:border-[#1E293B]/70 flex flex-col gap-3">
                  <div className="flex justify-between items-start text-xs">
                    <div className="flex flex-col">
                      <span className="font-bold">{app.title}</span>
                      <span className="text-[10px] text-[#94A3B8]">ID: {app.id}</span>
                    </div>
                    <span className={`badge ${app.status === 'approved' ? 'badge-success' : 'badge-primary'}`}>{app.status}</span>
                  </div>
                  
                  {app.history && app.history.length > 0 && (
                    <div className="text-[11px] text-[#475569] dark:text-[#94A3B8] border-t border-[#E2E8F0]/40 dark:border-[#1E293B]/40 pt-2.5 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 bg-blue-500 rounded-full shrink-0" />
                      <span className="font-bold text-blue-500">{app.history[app.history.length - 1].status}:</span>
                      <span>{app.history[app.history.length - 1].desc}</span>
                    </div>
                  )}
                </div>
              ))}
              {applications.length === 0 && <p className="text-xs text-[#94A3B8] text-center py-4">No trackers registered.</p>}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

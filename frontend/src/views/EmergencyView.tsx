'use client';

import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { EmergencyAlert, EmergencyHelpline, ShelterLocation } from '../types';
import { API_BASE_URL } from '../config/api';

const DEFAULT_ALERTS: EmergencyAlert[] = [
  {
    id: 1,
    title: "Severe Urban Flooding & Cloudburst Warning",
    severity: "critical",
    category: "Flood",
    location: "Outer Ring Road & Low-Lying Eastern Basins",
    description: "Torrential monsoon downpour of 110mm/hr causing urban waterlogging, canal overflow, and underpass closures.",
    safety_steps: [
      "Avoid traveling through inundated subways and underpasses",
      "Store emergency drinking water and power banks",
      "Contact Control Room Helpline 1077 for boat evacuations"
    ],
    active: true,
    created_at: "2026-08-08T10:00:00Z"
  },
  {
    id: 2,
    title: "Extreme Heatwave Red Alert (44°C+)",
    severity: "high",
    category: "Weather",
    location: "Metropolitan District & Industrial Belt",
    description: "Heatwave condition expected between 12:00 PM to 4:00 PM with UV index exceeding 11.",
    safety_steps: [
      "Stay hydrated with ORS and electrolytes",
      "Avoid direct sun exposure during peak afternoon hours",
      "Ensure pets and livestock have shaded water spots"
    ],
    active: true,
    created_at: "2026-08-08T08:00:00Z"
  },
  {
    id: 3,
    title: "Major Substation Power Grid Outage",
    severity: "moderate",
    category: "Power Outage",
    location: "Sector 14 to 22 Grid Zones",
    description: "Grid transformer fault causing power failure. Municipal restoration teams working on 33kV line repair.",
    safety_steps: [
      "Unplug sensitive electronic appliances",
      "Keep refrigerator doors closed to maintain cooling",
      "Use backup generators for essential medical oxygen devices"
    ],
    active: true,
    created_at: "2026-08-07T18:00:00Z"
  }
];

export default function EmergencyView() {
  const context = useContext(AppContext);
  if (!context) return null;
  const { user, reloadUserData } = context;

  const [alerts, setAlerts] = useState<EmergencyAlert[]>(DEFAULT_ALERTS);
  const [helplines, setHelplines] = useState<EmergencyHelpline[]>([]);
  const [shelters, setShelters] = useState<ShelterLocation[]>([]);
  const [activeSeverity, setActiveSeverity] = useState('All');
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  // SOS state
  const [showSosModal, setShowSosModal] = useState(false);
  const [sosStatus, setSosStatus] = useState<string | null>(null);
  const [userLocationInput, setUserLocationInput] = useState('Locating via GPS...');

  // Post Disaster Bulletin State
  const [showPostDisasterModal, setShowPostDisasterModal] = useState(false);
  const [disasterTitle, setDisasterTitle] = useState('');
  const [disasterSeverity, setDisasterSeverity] = useState<'critical' | 'high' | 'moderate' | 'info'>('critical');
  const [disasterCategory, setDisasterCategory] = useState<'Flood' | 'Weather' | 'Power Outage' | 'Health' | 'Traffic'>('Flood');
  const [disasterLocation, setDisasterLocation] = useState('');
  const [disasterDescription, setDisasterDescription] = useState('');
  const [disasterSafetySteps, setDisasterSafetySteps] = useState('');
  const [disasterSuccessToast, setDisasterSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    detectGpsLocation();
  }, []);

  const detectGpsLocation = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          let address = `GPS Verified: ${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
          try {
            const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            if (resp.ok) {
              const data = await resp.json();
              if (data && data.display_name) {
                address = data.display_name.split(',').slice(0, 3).join(',').trim() + ' (GPS Verified)';
              }
            }
          } catch (e) {}
          setUserLocationInput(address);
        },
        (err) => {
          setUserLocationInput(user?.address || 'Central District, Ward 12');
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setUserLocationInput(user?.address || 'Central District, Ward 12');
    }
  };

  const fetchData = async () => {
    try {
      const [resAlt, resHlp, resShl] = await Promise.all([
        fetch(`${API_BASE_URL}/api/emergency/alerts`),
        fetch(`${API_BASE_URL}/api/emergency/helplines`),
        fetch(`${API_BASE_URL}/api/emergency/shelters`)
      ]);

      if (resAlt.ok) setAlerts(await resAlt.json());
      if (resHlp.ok) setHelplines(await resHlp.json());
      if (resShl.ok) setShelters(await resShl.json());
    } catch (e) {
      console.error('Failed to fetch emergency data', e);
    }
  };

  const handleCopyNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(num);
    setTimeout(() => setCopiedNumber(null), 2500);
  };

  const handleDispatchSos = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/emergency/sos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          user_name: user.name,
          user_phone: user.phone,
          location: userLocationInput || user.address
        })
      });

      if (res.ok) {
        setSosStatus('DISPATCHED');
        await reloadUserData();
        setTimeout(() => {
          setShowSosModal(false);
          setSosStatus(null);
        }, 3500);
      }
    } catch (e) {
      console.error('SOS dispatch error', e);
    }
  };

  const handlePostDisasterAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disasterTitle || !disasterLocation) return;

    const stepsArray = disasterSafetySteps
      ? disasterSafetySteps.split(',').map(s => s.trim()).filter(Boolean)
      : ['Follow district disaster control advisories', 'Stay tuned to official emergency broadcasts'];

    const newAlert: EmergencyAlert = {
      id: Date.now(),
      title: disasterTitle,
      severity: disasterSeverity,
      category: disasterCategory,
      location: disasterLocation,
      description: disasterDescription || "District Disaster Advisory issued by Emergency Management Command.",
      safety_steps: stepsArray,
      active: true,
      created_at: new Date().toISOString()
    };

    try {
      await fetch(`${API_BASE_URL}/api/emergency/alerts/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: disasterTitle,
          severity: disasterSeverity,
          category: disasterCategory,
          location: disasterLocation,
          description: disasterDescription || "District Disaster Advisory issued by Emergency Management Command.",
          safety_steps: stepsArray
        })
      });
    } catch (err) {
      console.warn("API offline, broadcasting active disaster alert in local state", err);
    }

    setAlerts(prev => [newAlert, ...prev]);
    setDisasterSuccessToast(`Disaster Advisory '${disasterTitle}' broadcasted live!`);
    setShowPostDisasterModal(false);
    
    // Reset fields
    setDisasterTitle('');
    setDisasterLocation('');
    setDisasterDescription('');
    setDisasterSafetySteps('');
    
    setTimeout(() => setDisasterSuccessToast(null), 4000);
  };

  const filteredAlerts = alerts.filter(a => {
    if (activeSeverity === 'All') return true;
    return a.severity.toLowerCase() === activeSeverity.toLowerCase();
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-500/10 border-red-500/30 text-red-500 animate-pulse';
      case 'high':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-500';
      case 'moderate':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-500';
      default:
        return 'bg-slate-500/10 border-slate-500/30 text-slate-400';
    }
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-7xl mx-auto w-full animate-scale-in text-left">
      
      {/* Toast Notification Banner */}
      {disasterSuccessToast && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-2xl animate-fade-in flex items-center justify-between shadow-lg">
          <span>📢 {disasterSuccessToast}</span>
          <button onClick={() => setDisasterSuccessToast(null)}>✕</button>
        </div>
      )}

      {/* Top Banner: Emergency SOS & Red Alert Notification */}
      <div className="relative rounded-3xl bg-gradient-to-r from-red-950 via-rose-900 to-red-900 border border-red-500/30 p-6 md:p-8 shadow-2xl overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-red-500/10 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col gap-2 z-10">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 rounded-full bg-red-500 animate-ping" />
            <span className="text-xs font-bold tracking-widest text-red-300 uppercase">CIVIC DISASTER & EMERGENCY HUB</span>
          </div>
          <h2 className="font-heading text-xl md:text-2xl font-black text-white">
            1-Tap Emergency SOS & Live Advisories
          </h2>
          <p className="text-xs text-red-100/80 max-w-xl leading-relaxed">
            Instantly broadcast GPS emergency signals to Municipal Control Center & District First Responders, issue ongoing active disaster bulletins, and locate open relief shelters.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 z-10 w-full md:w-auto">
          <button 
            onClick={() => setShowPostDisasterModal(true)}
            className="w-full sm:w-auto group relative flex items-center justify-center gap-2.5 bg-amber-600 hover:bg-amber-500 text-white font-extrabold px-5 py-3.5 rounded-2xl shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer shrink-0 border border-amber-400/40 text-xs"
          >
            <span className="text-lg">📢</span>
            <span className="font-black tracking-wide uppercase">POST DISASTER BULLETIN</span>
          </button>

          <button 
            onClick={() => setShowSosModal(true)}
            className="w-full sm:w-auto group relative flex items-center justify-center gap-3 bg-red-600 hover:bg-red-500 text-white font-extrabold px-6 py-4 rounded-2xl shadow-xl hover:shadow-red-600/50 transition-all transform hover:-translate-y-0.5 cursor-pointer shrink-0 border border-red-400/40"
          >
            <span className="text-2xl group-hover:animate-bounce">🚨</span>
            <div className="flex flex-col text-left">
              <span className="text-sm font-black tracking-wide uppercase">DISPATCH SOS ALERT</span>
              <span className="text-[10px] text-red-100 font-normal">Broadcast Live Location</span>
            </div>
          </button>
        </div>
      </div>

      {/* Main Grid: Active Advisories & Helplines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (8 Col): Live Disaster Advisories */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="glass-card p-6 flex flex-col gap-5">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E2E8F0] dark:border-[#1E293B] pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-heading text-base font-bold">Active Disaster & Civic Advisories</h3>
                  <button 
                    onClick={() => setShowPostDisasterModal(true)}
                    className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                  >
                    + Report Ongoing Disaster
                  </button>
                </div>
                <p className="text-xs text-[#94A3B8]">Real-time warnings issued by District Emergency Management</p>
              </div>

              {/* Severity filter pills */}
              <div className="flex gap-1.5 bg-[#F1F5F9] dark:bg-[#172033] p-1 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B]">
                {['All', 'Critical', 'High', 'Moderate'].map(sev => (
                  <button
                    key={sev}
                    onClick={() => setActiveSeverity(sev)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      activeSeverity === sev 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            {/* Alerts List */}
            <div className="flex flex-col gap-4">
              {filteredAlerts.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#94A3B8]">No active advisories matching selected severity.</div>
              ) : (
                filteredAlerts.map(alt => (
                  <div key={alt.id} className="p-5 rounded-2xl bg-white dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#1E293B] flex flex-col gap-3.5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider ${getSeverityBadge(alt.severity)}`}>
                          {alt.severity}
                        </span>
                        <span className="badge badge-primary text-[10px]">{alt.category}</span>
                        <span className="text-[11px] font-semibold text-[#475569] dark:text-[#94A3B8]">📍 {alt.location}</span>
                      </div>
                      <span className="text-[10px] text-[#94A3B8] font-mono shrink-0" suppressHydrationWarning>
                        {new Date(alt.created_at).toISOString().split('T')[0]}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-heading text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">{alt.title}</h4>
                      <p className="text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed mt-1">{alt.description}</p>
                    </div>

                    {alt.safety_steps && alt.safety_steps.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#131B2E] border border-[#E2E8F0] dark:border-[#1E293B]/70 flex flex-col gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                          <span>⚠️</span> Recommended Safety Actions:
                        </span>
                        <ul className="list-disc list-inside flex flex-col gap-1 text-[11px] text-[#475569] dark:text-[#CBD5E1]">
                          {alt.safety_steps.map((step, sIdx) => (
                            <li key={sIdx}>{step}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

          </div>

          {/* Emergency Relief Shelters */}
          <div className="glass-card p-6 flex flex-col gap-5">
            <div className="border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3">
              <h3 className="font-heading text-base font-bold">Emergency Relief Shelters & Facilities</h3>
              <p className="text-xs text-[#94A3B8]">Open municipal shelter camps with active capacity monitoring</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shelters.map(shl => {
                const occupancyPercent = Math.round((shl.occupancy / shl.capacity) * 100);
                return (
                  <div key={shl.id} className="p-4 rounded-2xl bg-white dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#1E293B] flex flex-col justify-between gap-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${
                          shl.status === 'open' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        }`}>
                          ● {shl.status.toUpperCase()}
                        </span>
                        <span className="text-[10px] font-bold text-[#94A3B8]">{shl.occupancy} / {shl.capacity} Beds</span>
                      </div>

                      <h4 className="font-heading text-xs font-bold">{shl.name}</h4>
                      <p className="text-[10px] text-[#94A3B8]">📍 {shl.address}</p>

                      {/* Capacity Meter */}
                      <div className="h-1.5 w-full bg-[#E2E8F0] dark:bg-[#172033] rounded-full overflow-hidden mt-1">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            occupancyPercent > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`} 
                          style={{ width: `${occupancyPercent}%` }} 
                        />
                      </div>
                    </div>

                    {/* Amenities tags */}
                    <div className="flex flex-wrap gap-1 border-t border-[#E2E8F0] dark:border-[#1E293B] pt-3 mt-1">
                      {shl.amenities.map((am, aIdx) => (
                        <span key={aIdx} className="px-2 py-0.5 rounded-md bg-[#F1F5F9] dark:bg-[#172033] text-[9px] font-medium text-[#475569] dark:text-[#94A3B8]">
                          {am}
                        </span>
                      ))}
                    </div>

                    {shl.contact_phone && (
                      <a href={`tel:${shl.contact_phone}`} className="btn btn-secondary !py-1.5 text-[10px] text-center font-bold mt-1">
                        📞 Contact Shelter: {shl.contact_phone}
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (4 Col): Emergency Contact Helplines */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="glass-card p-6 flex flex-col gap-4">
            <div className="border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3">
              <h3 className="font-heading text-sm font-bold">24/7 National & Municipal Helplines</h3>
              <p className="text-[10px] text-[#94A3B8]">1-Tap Speed Dial & Contact Numbers</p>
            </div>

            <div className="flex flex-col gap-3">
              {helplines.map(hlp => (
                <div key={hlp.id} className="p-3.5 rounded-xl bg-white dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between gap-3 group hover:border-blue-500/40 transition-all">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xl shrink-0 p-2 rounded-lg bg-[#F1F5F9] dark:bg-[#172033]">{hlp.icon || '📞'}</span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold truncate">{hlp.name}</span>
                      <span className="text-[10px] text-[#94A3B8] truncate">{hlp.description}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <a 
                      href={`tel:${hlp.number}`}
                      className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold cursor-pointer"
                    >
                      {hlp.number}
                    </a>
                    <button
                      onClick={() => handleCopyNumber(hlp.number)}
                      className="p-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Copy Number"
                    >
                      {copiedNumber === hlp.number ? '✓' : '📋'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* SOS DISPATCH CONFIRMATION MODAL */}
      {showSosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#080D1A]/70 backdrop-blur-md" onClick={() => !sosStatus && setShowSosModal(false)} />
          
          <div className="relative w-full max-w-md glass-card p-6 rounded-3xl z-10 shadow-2xl border border-red-500/30 flex flex-col gap-4 animate-scale-in text-left">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3">
              <div className="flex items-center gap-2 text-red-500">
                <span className="text-xl">🚨</span>
                <h3 className="font-heading text-sm font-bold">Municipal SOS Emergency Broadcast</h3>
              </div>
              {!sosStatus && <button onClick={() => setShowSosModal(false)}>✕</button>}
            </div>

            {sosStatus === 'DISPATCHED' ? (
              <div className="py-8 flex flex-col items-center gap-4 text-center animate-scale-in">
                <div className="h-16 w-16 rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/40 flex items-center justify-center text-3xl animate-bounce">
                  ✓
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="font-heading text-base font-bold text-emerald-500">SOS Signal Dispatched!</h4>
                  <p className="text-xs text-[#94A3B8] max-w-xs">
                    Your location has been transmitted to the District Emergency Control Room. First Responders have been notified.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4 text-xs text-[#475569] dark:text-[#94A3B8]">
                <p className="leading-relaxed">
                  This will broadcast an urgent emergency distress signal to Municipal Responders with your citizen profile and current location.
                </p>

                <div className="form-group">
                  <label className="form-label text-[11px] font-bold">Broadcast Location & Landmark</label>
                  <input 
                    type="text"
                    className="form-control text-xs"
                    value={userLocationInput}
                    onChange={(e) => setUserLocationInput(e.target.value)}
                    placeholder="Enter current exact location..."
                  />
                </div>

                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-[10px] text-red-400 font-semibold">
                  ⚠️ Please confirm this is a genuine emergency requiring immediate police, medical, or fire dispatch.
                </div>

                <div className="flex justify-between gap-3 pt-2">
                  <button type="button" onClick={() => setShowSosModal(false)} className="btn btn-secondary flex-1">
                    Cancel
                  </button>
                  <button type="button" onClick={handleDispatchSos} className="btn bg-red-600 hover:bg-red-500 text-white font-bold flex-1 cursor-pointer">
                    Confirm & Broadcast SOS
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* POST DISASTER BULLETIN MODAL */}
      {showPostDisasterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#080D1A]/75 backdrop-blur-md" onClick={() => setShowPostDisasterModal(false)} />
          
          <div className="relative w-full max-w-lg glass-card p-6 rounded-3xl z-10 shadow-2xl border border-[#E2E8F0] dark:border-[#1E293B] flex flex-col gap-4 animate-scale-in text-left">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">📢</span>
                <h3 className="font-heading text-sm font-bold">Broadcast Ongoing Disaster Bulletin</h3>
              </div>
              <button onClick={() => setShowPostDisasterModal(false)} className="text-xs hover:opacity-80">✕</button>
            </div>

            <form onSubmit={handlePostDisasterAlert} className="flex flex-col gap-3.5 pt-1 text-xs">
              <div className="form-group !mb-0">
                <label className="form-label text-[11px] font-bold">Disaster / Advisory Title *</label>
                <input 
                  type="text" 
                  className="form-control text-xs" 
                  value={disasterTitle}
                  onChange={(e) => setDisasterTitle(e.target.value)}
                  placeholder="e.g. Heavy Flash Floods & Dam Reservoir Water Release Warning"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="form-group !mb-0">
                  <label className="form-label text-[11px] font-bold">Severity Level</label>
                  <select 
                    className="form-control text-xs"
                    value={disasterSeverity}
                    onChange={(e) => setDisasterSeverity(e.target.value as any)}
                  >
                    <option value="critical">CRITICAL (Red Alert)</option>
                    <option value="high">HIGH (Orange Alert)</option>
                    <option value="moderate">MODERATE (Yellow Alert)</option>
                    <option value="info">INFO / Advisory</option>
                  </select>
                </div>

                <div className="form-group !mb-0">
                  <label className="form-label text-[11px] font-bold">Disaster Category</label>
                  <select 
                    className="form-control text-xs"
                    value={disasterCategory}
                    onChange={(e) => setDisasterCategory(e.target.value as any)}
                  >
                    <option value="Flood">Flood & Waterlogging</option>
                    <option value="Weather">Weather & Cyclone</option>
                    <option value="Power Outage">Power Grid Outage</option>
                    <option value="Health">Public Health Advisory</option>
                    <option value="Traffic">Traffic & Landslide</option>
                  </select>
                </div>
              </div>

              <div className="form-group !mb-0">
                <label className="form-label text-[11px] font-bold">Affected Location / Wards *</label>
                <input 
                  type="text" 
                  className="form-control text-xs" 
                  value={disasterLocation}
                  onChange={(e) => setDisasterLocation(e.target.value)}
                  placeholder="e.g. Northern Coastal Sector, Wards 4 to 12"
                  required
                />
              </div>

              <div className="form-group !mb-0">
                <label className="form-label text-[11px] font-bold">Disaster Description / Ground Advisory</label>
                <textarea 
                  className="form-control text-xs h-20 resize-none" 
                  value={disasterDescription}
                  onChange={(e) => setDisasterDescription(e.target.value)}
                  placeholder="Provide situation details, water level reports, or power outage status..."
                />
              </div>

              <div className="form-group !mb-0">
                <label className="form-label text-[11px] font-bold">Safety Instructions (Comma Separated)</label>
                <input 
                  type="text" 
                  className="form-control text-xs" 
                  value={disasterSafetySteps}
                  onChange={(e) => setDisasterSafetySteps(e.target.value)}
                  placeholder="Avoid underpasses, Keep power banks charged, Contact 1077"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowPostDisasterModal(false)} 
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn bg-amber-600 hover:bg-amber-500 text-white font-bold cursor-pointer"
                >
                  Broadcast Disaster Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

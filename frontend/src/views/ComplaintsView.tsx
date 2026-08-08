'use client';

import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import LeafletMap from '../components/LeafletMap';

export default function ComplaintsView() {
  const context = useContext(AppContext);
  if (!context) return null;
  const { complaints, submitCivicComplaint, upvoteCivicComplaint } = context;

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Potholes' | 'Garbage' | 'Water Leakage' | 'Streetlight Failure' | 'Road Damage' | 'Illegal Dumping'>('Potholes');
  const [urgency, setUrgency] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [xCoord, setXCoord] = useState(250);
  const [yCoord, setYCoord] = useState(150);
  const [error, setError] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Search and filter states
  const [filterStatus, setFilterStatus] = useState<'All' | 'new' | 'investigating' | 'resolved'>('All');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'upvotes' | 'newest'>('upvotes');

  const handleMapSelection = (x: number, y: number, addressName?: string) => {
    setXCoord(x);
    setYCoord(y);
    if (addressName) {
      setLocation(addressName);
    } else {
      setLocation(`Geo-Pin [Lat: ${x.toFixed(4)}, Lng: ${y.toFixed(4)}]`);
    }
  };

  const handleDetectLocation = () => {
    setIsLocating(true);
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setXCoord(lat);
          setYCoord(lng);
          let addr = `GPS Pin: ${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
          try {
            const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            if (resp.ok) {
              const data = await resp.json();
              if (data && data.display_name) {
                addr = data.display_name.split(',').slice(0, 3).join(',').trim();
              }
            }
          } catch (e) {}
          setLocation(addr);
          setIsLocating(false);
        },
        (err) => {
          setLocation('Central Sector, Ward 14');
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setLocation('Central Sector, Ward 14');
      setIsLocating(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !location || !description) {
      setError('Please provide title, location, and description.');
      return;
    }

    await submitCivicComplaint(title, category, description, location, xCoord, yCoord);
    
    setSuccessToast(`Civic issue '${title}' submitted successfully! Assigned to Municipal Ward Dispatch.`);
    setTitle('');
    setDescription('');
    setLocation('');
    setError('');
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const categories = [
    { name: 'Potholes', icon: '🚧', label: 'Potholes & Road' },
    { name: 'Garbage', icon: '🗑️', label: 'Garbage & Waste' },
    { name: 'Water Leakage', icon: '💧', label: 'Water Leakage' },
    { name: 'Streetlight Failure', icon: '💡', label: 'Streetlight' },
    { name: 'Road Damage', icon: '⚠️', label: 'Obstructions' },
    { name: 'Illegal Dumping', icon: '☣️', label: 'Illegal Dumping' }
  ];

  const filteredComplaints = complaints.filter(cmp => {
    const matchesStatus = filterStatus === 'All' || cmp.status?.toLowerCase() === filterStatus.toLowerCase();
    const matchesCategory = filterCategory === 'All' || cmp.category === filterCategory;
    const matchesSearch = cmp.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          cmp.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          cmp.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  }).sort((a: any, b: any) => {
    if (sortBy === 'upvotes') return b.upvotes - a.upvotes;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const totalCount = complaints.length;
  const newCount = complaints.filter(c => c.status === 'new').length;
  const investigatingCount = complaints.filter(c => c.status === 'investigating').length;
  const resolvedCount = complaints.filter(c => c.status === 'resolved').length;
  const totalUpvotes = complaints.reduce((sum, c) => sum + (c.upvotes || 0), 0);

  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-7xl mx-auto w-full animate-scale-in text-left">
      
      {/* Success Toast Notification */}
      {successToast && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-2xl animate-fade-in flex items-center justify-between shadow-lg">
          <span>✅ {successToast}</span>
          <button onClick={() => setSuccessToast(null)} className="hover:opacity-80">✕</button>
        </div>
      )}

      {/* Top Hero Analytics Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-500/30 p-6 md:p-8 shadow-2xl overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col gap-2 z-10">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold tracking-widest text-blue-300 uppercase">GEO-SPATIAL CIVIC RADAR & GIS PORTAL</span>
          </div>
          <h2 className="font-heading text-xl md:text-2xl font-black text-white">
            Community Issue Reporting & Live Map Tracking
          </h2>
          <p className="text-xs text-blue-100/80 max-w-xl leading-relaxed">
            Report civic hazards, upvote community concerns, track municipal inspection dispatch, and view real-time geo-tagged resolution updates across wards.
          </p>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 z-10 w-full md:w-auto shrink-0">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col">
            <span className="text-[10px] text-blue-200 uppercase font-bold tracking-wider">Total Issues</span>
            <span className="text-xl font-black text-white">{totalCount}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 backdrop-blur-md flex flex-col">
            <span className="text-[10px] text-amber-300 uppercase font-bold tracking-wider">In Progress</span>
            <span className="text-xl font-black text-amber-400">{investigatingCount + newCount}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md flex flex-col">
            <span className="text-[10px] text-emerald-300 uppercase font-bold tracking-wider">Resolved</span>
            <span className="text-xl font-black text-emerald-400">{resolvedCount}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-md flex flex-col">
            <span className="text-[10px] text-indigo-300 uppercase font-bold tracking-wider">Upvotes</span>
            <span className="text-xl font-black text-indigo-300">▲ {totalUpvotes}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Form Left (5 Col) + Map & Feed Right (7 Col) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Submit Issue Command Form (Col: 5) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="glass-card p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3.5">
              <div className="flex items-center gap-2">
                <span className="text-lg">📢</span>
                <h3 className="font-heading text-base font-bold">Report Civic Issue</h3>
              </div>
              <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-md">GIS Tagged</span>
            </div>
            
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-500 rounded-xl">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
              
              {/* Category Pills Grid */}
              <div className="flex flex-col gap-1.5">
                <label className="form-label text-[11px] font-bold">Issue Category *</label>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => setCategory(cat.name as any)}
                      className={`p-2.5 rounded-xl border text-[10px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        category === cat.name
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-[1.02]'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-[#E2E8F0] dark:border-[#1E293B] text-[#475569] dark:text-[#94A3B8] hover:border-blue-400'
                      }`}
                    >
                      <span className="text-base">{cat.icon}</span>
                      <span className="truncate w-full text-center">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title Input */}
              <div className="form-group !mb-0">
                <label className="form-label text-[11px] font-bold">Complaint Title *</label>
                <input 
                  type="text" 
                  className="form-control text-xs"
                  placeholder="e.g. Deep Pothole Grid near Gate 3 Intersection"
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); setError(''); }}
                />
              </div>

              {/* Location Input + Live GPS Detector */}
              <div className="form-group !mb-0">
                <div className="flex items-center justify-between mb-1">
                  <label className="form-label text-[11px] font-bold !mb-0">Location & Landmark *</label>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={isLocating}
                    className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    📍 {isLocating ? 'Locating GPS...' : 'Detect GPS Location'}
                  </button>
                </div>
                <input 
                  type="text" 
                  className="form-control text-xs"
                  placeholder="e.g. Block C, Saket Colony or Click Map Pin"
                  value={location}
                  onChange={(e) => { setLocation(e.target.value); setError(''); }}
                />
              </div>

              {/* Priority / Urgency Selector */}
              <div className="form-group !mb-0">
                <label className="form-label text-[11px] font-bold">Urgency Priority Level</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Low', 'Medium', 'High', 'Critical'] as const).map((urg) => (
                    <button
                      key={urg}
                      type="button"
                      onClick={() => setUrgency(urg)}
                      className={`py-1.5 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                        urgency === urg
                          ? urg === 'Critical' ? 'bg-red-600 text-white border-red-600' :
                            urg === 'High' ? 'bg-amber-600 text-white border-amber-600' :
                            urg === 'Medium' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-600 text-white'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-[#E2E8F0] dark:border-[#1E293B] text-[#475569] dark:text-[#94A3B8]'
                      }`}
                    >
                      {urg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description Input */}
              <div className="form-group !mb-0">
                <label className="form-label text-[11px] font-bold">Ground Observations & Details *</label>
                <textarea 
                  className="form-control text-xs h-20 resize-none"
                  placeholder="Describe severity, traffic obstruction risk, or safety hazard parameters..."
                  value={description}
                  onChange={(e) => { setDescription(e.target.value); setError(''); }}
                />
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="btn btn-primary w-full py-3.5 text-xs font-black shadow-lg cursor-pointer flex items-center justify-center gap-2 transform hover:-translate-y-0.5 transition-all mt-1"
              >
                <span>📡</span>
                <span>Submit Geo-Tagged Complaint</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Interactive Map + Community Incident Feed (Col: 7) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Leaflet Dynamic GIS Map Card */}
          <div className="glass-card p-5 flex flex-col gap-4">
            <div className="border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🗺️</span>
                <div>
                  <h3 className="font-heading text-sm font-bold">Interactive GIS Geo-Map</h3>
                  <p className="text-[10px] text-[#94A3B8]">Click anywhere on map to pin coordinates</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-[10px] font-bold bg-[#F1F5F9] dark:bg-[#172033] px-3 py-1.5 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B]">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" /> New ({newCount})</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-500" /> Inspecting ({investigatingCount})</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Resolved ({resolvedCount})</span>
              </div>
            </div>

            {/* Map Container */}
            <div className="w-full h-[330px] rounded-2xl overflow-hidden relative border border-[#E2E8F0] dark:border-[#1E293B] shadow-inner">
              <LeafletMap 
                complaints={filteredComplaints}
                selectedX={xCoord}
                selectedY={yCoord}
                onMapClick={handleMapSelection}
              />
            </div>
          </div>

          {/* Active Community Reports Feed */}
          <div className="glass-card p-5 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">📋</span>
                <h3 className="font-heading text-sm font-bold">Community Incident Feed ({filteredComplaints.length})</h3>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {/* Search Bar */}
                <input
                  type="text"
                  placeholder="Search issues or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#0F1626] focus:outline-none w-full sm:w-44 shadow-xs"
                />
                
                {/* Sort Toggle */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-2 py-1.5 text-xs rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#0F1626] font-bold text-slate-700 dark:text-slate-200"
                >
                  <option value="upvotes">🔥 Top Upvoted</option>
                  <option value="newest">🕒 Newest First</option>
                </select>
              </div>
            </div>

            {/* Status & Category Pills */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] dark:border-[#1E293B]/60 pb-3">
              {/* Status Filter */}
              <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-[10px] font-bold">
                {(['All', 'new', 'investigating', 'resolved'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setFilterStatus(st)}
                    className={`px-2.5 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                      filterStatus === st 
                        ? 'bg-blue-600 text-white shadow-xs font-extrabold' 
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Category Filter Dropdown */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-2.5 py-1 text-[10px] font-bold rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                <option value="All">All Categories</option>
                <option value="Potholes">Potholes</option>
                <option value="Garbage">Garbage</option>
                <option value="Water Leakage">Water Leakage</option>
                <option value="Streetlight Failure">Streetlight</option>
                <option value="Road Damage">Road Obstructions</option>
                <option value="Illegal Dumping">Illegal Dumping</option>
              </select>
            </div>

            {/* Incidents List Container */}
            <div className="flex flex-col gap-3.5 max-h-[400px] overflow-y-auto pr-1">
              {filteredComplaints.length === 0 ? (
                <div className="text-center py-10 text-xs text-[#94A3B8] font-semibold">
                  No community reports matching selected parameters.
                </div>
              ) : (
                filteredComplaints.map((cmp: any) => (
                  <div key={cmp.id} className="p-4 rounded-2xl bg-white dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#1E293B] flex gap-4 hover:border-blue-500/40 transition-all shadow-sm">
                    
                    {/* Upvote Pill Button */}
                    <button 
                      onClick={() => upvoteCivicComplaint(cmp.id)}
                      className="h-12 w-12 rounded-2xl border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/15 flex flex-col items-center justify-center shrink-0 cursor-pointer text-xs font-black text-blue-600 dark:text-blue-400 transition-all hover:scale-105"
                      title="Upvote Issue"
                    >
                      <span className="text-xs">▲</span>
                      <span>{cmp.upvotes}</span>
                    </button>

                    <div className="flex flex-col gap-2 flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-[#0F172A] dark:text-white leading-snug">{cmp.title}</span>
                          <span className="text-[10px] font-semibold text-[#64748B] dark:text-[#94A3B8]">📍 {cmp.location}</span>
                        </div>

                        <span className={`px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-wider shrink-0 ${
                          cmp.status === 'resolved' 
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' 
                            : cmp.status === 'investigating' 
                            ? 'bg-blue-500/10 text-blue-500 border-blue-500/30 animate-pulse' 
                            : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                        }`}>
                          ● {cmp.status}
                        </span>
                      </div>

                      <p className="text-[11px] text-[#475569] dark:text-[#94A3B8] leading-relaxed">{cmp.description}</p>
                      
                      <div className="flex items-center justify-between pt-1 border-t border-[#E2E8F0]/60 dark:border-[#1E293B]/50 text-[9px] font-bold text-[#94A3B8]">
                        <span>Resident Geo-Report • Category: {cmp.category}</span>
                        <span className="text-blue-500">SLA Tracked: 24h</span>
                      </div>
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

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
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [xCoord, setXCoord] = useState(250);
  const [yCoord, setYCoord] = useState(150);
  const [error, setError] = useState('');

  const handleMapSelection = (x: number, y: number, addressName?: string) => {
    setXCoord(x);
    setYCoord(y);
    if (addressName) {
      setLocation(addressName);
    } else {
      setLocation(`Picked Location: [X: ${x}, Y: ${y}]`);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !location || !description) {
      setError('Please fill in all complaint details.');
      return;
    }

    await submitCivicComplaint(title, category, description, location, xCoord, yCoord);
    
    // Reset Form
    setTitle('');
    setDescription('');
    setLocation('');
    setError('');
  };

  // Search and filter states
  const [filterStatus, setFilterStatus] = useState<'All' | 'new' | 'investigating' | 'resolved'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredComplaints = complaints.filter(cmp => {
    const matchesStatus = filterStatus === 'All' || cmp.status?.toLowerCase() === filterStatus.toLowerCase();
    const matchesSearch = cmp.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          cmp.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          cmp.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-7xl mx-auto w-full animate-scale-in text-left">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Submit issue form (Col: 5) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="glass-card p-5 flex flex-col gap-4">
            <h3 className="font-heading text-sm font-bold border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3">Report Civic Complaint</h3>
            
            {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-500">{error}</div>}

            <form onSubmit={handleFormSubmit} className="flex flex-col gap-4 pt-1">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select 
                  className="form-control text-xs"
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                >
                  <option value="Potholes">Potholes & Road damage</option>
                  <option value="Garbage">Garbage & Waste accumulation</option>
                  <option value="Water Leakage">Water Leakage / Pipe bursts</option>
                  <option value="Streetlight Failure">Streetlight Failure</option>
                  <option value="Road Damage">Road Obstructions</option>
                  <option value="Illegal Dumping">Illegal Dumping</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Complaint Title</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="e.g. Broken light bulb at gateway intersection"
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); setError(''); }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Location details (or click map on right)</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="e.g. Coordinates [X: 250, Y: 150]"
                  value={location}
                  onChange={(e) => { setLocation(e.target.value); setError(''); }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Observations details</label>
                <textarea 
                  className="form-control h-20 resize-none"
                  placeholder="Provide parameters to help inspection crews identify the concern..."
                  value={description}
                  onChange={(e) => { setDescription(e.target.value); setError(''); }}
                />
              </div>

              <button type="submit" className="btn btn-primary w-full py-3 cursor-pointer">
                Submit Civic Complaint
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Map + Community list (Col: 7) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Leaflet Dynamic Map */}
          <div className="glass-card p-5 flex flex-col gap-4">
            <div className="border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3 flex justify-between items-center">
              <h3 className="font-heading text-sm font-bold">Interactive Digital Map</h3>
              <div className="flex gap-2.5 text-[9px] font-bold">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> New</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" /> Investigating</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Resolved</span>
              </div>
            </div>

            {/* Map Frame */}
            <div className="w-full h-[320px] rounded-xl overflow-hidden relative">
              <LeafletMap 
                complaints={filteredComplaints}
                selectedX={xCoord}
                selectedY={yCoord}
                onMapClick={handleMapSelection}
              />
            </div>
          </div>

          {/* Community list */}
          <div className="glass-card p-5 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3">
              <h3 className="font-heading text-sm font-bold">Active Community Reports ({filteredComplaints.length})</h3>
              
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Filter issues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-2.5 py-1 text-xs rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#0F1626] focus:outline-none w-full sm:w-36"
                />
                
                <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[10px] font-bold">
                  {(['All', 'new', 'investigating', 'resolved'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setFilterStatus(st)}
                      className={`px-2 py-1 rounded-md capitalize transition-all cursor-pointer ${
                        filterStatus === st 
                          ? 'bg-white dark:bg-slate-700 shadow-xs text-blue-600 dark:text-blue-400 font-extrabold' 
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 max-h-[350px] overflow-y-auto pr-1">
              {filteredComplaints.map((cmp) => (
                <div key={cmp.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-[#E2E8F0] dark:border-[#1E293B]/70 flex gap-4 hover:scale-[1.005] transition-transform">
                  
                  {/* Upvote button */}
                  <button 
                    onClick={() => upvoteCivicComplaint(cmp.id)}
                    className="h-11 w-11 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#0F1626] flex flex-col items-center justify-center shrink-0 cursor-pointer text-[10px] font-bold text-slate-400 hover:border-blue-500 hover:text-blue-500"
                  >
                    <span>▲</span>
                    <span>{cmp.upvotes}</span>
                  </button>

                  <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold truncate leading-normal">{cmp.title}</span>
                        <span className="text-[10px] text-[#94A3B8]">{cmp.location}</span>
                      </div>
                      <span className={`badge ${
                        cmp.status === 'resolved' ? 'badge-success' : 
                        cmp.status === 'investigating' ? 'badge-primary' : 'badge-danger'
                      } text-[9px] font-bold shrink-0`}>
                        {cmp.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#475569] dark:text-[#94A3B8] leading-relaxed">{cmp.description}</p>
                    <span className="text-[9px] text-[#94A3B8] font-bold mt-1">Reported by Resident • Category: {cmp.category}</span>
                  </div>
                </div>
              ))}
              {filteredComplaints.length === 0 && <p className="text-xs text-[#94A3B8] text-center py-4">No matching complaints found.</p>}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
